import SlaughterClosure from '../models/SlaughterClosure.js';
import SlaughterSchedule from '../models/SlaughterSchedule.js';
import SlaughterLot from '../models/SlaughterLot.js';


/**
 * @desc    Cria fechamento a partir de escala terminada
 * @route   POST /api/slaughter/closure/:date/from-pre
 */
export const createFromSchedule = async (req, res) => {
    try {
        const { date } = req.params;
        const targetDate = new Date(date + 'T00:00:00.000Z');

        // Verificar se escala está CLOSED
        const schedule = await SlaughterSchedule.findOne({ slaughterDate: targetDate }).populate('lots');
        
        if (!schedule || schedule.status !== 'CLOSED') {
            return res.status(400).json({ success: false, message: 'A escala deve estar FECHADA (CLOSED) para iniciar o fechamento SIF' });
        }

        // Verificar se já existe fechamento
        let closure = await SlaughterClosure.findOne({ date: targetDate });
        if (closure) {
            return res.status(400).json({ success: false, message: 'Já existe um fechamento SIF para esta data' });
        }

        // Criar linhas a partir dos lotes
        const lines = schedule.lots.map((lot, idx) => ({
            sequence: idx + 1,
            preLotRefId: lot._id.toString(), // Chave de vínculo
            producerName: lot.rancherName,
            municipio: lot.municipio || '', 
            uf: lot.uf || '',
            boi: lot.boi || 0,
            vaca: lot.vaca || 0,
            novilha: lot.novilha || 0,
            bubalino: lot.bubalino || 0,
            touro: lot.touro || 0,
            total: lot.total,
            brokerCode: lot.brokerNumber,
            curral: '',
            cor: '',
            nf: '',
            gta: ''
        }));

        closure = await SlaughterClosure.create({
            date: targetDate,
            scheduleId: schedule._id,
            header: {
                slaughterDate: targetDate,
                sifNumber: process.env.SIF_ESTABLISHMENT || 'SIF 4141',
                veterinarian: ''
            },
            lines,
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, data: closure });
    } catch (error) {
        console.error('Erro ao criar fechamento:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Busca fechamento por data
 * @route   GET /api/slaughter/closure/:date
 */
export const getByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const targetDate = new Date(date + 'T00:00:00.000Z');

        const closure = await SlaughterClosure.findOne({ date: targetDate });
        res.json({ success: true, data: closure });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Atualiza fechamento
 * @route   PUT /api/slaughter/closure/:id
 */
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const closure = await SlaughterClosure.findById(id);

        if (!closure || closure.status === 'CLOSED') {
            return res.status(400).json({ success: false, message: 'Fechamento não encontrado ou já está fechado' });
        }

        Object.assign(closure, req.body);
        closure.updatedBy = req.user._id;
        await closure.save();

        res.json({ success: true, data: closure });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Reordena linhas do fechamento
 * @route   POST /api/slaughter/closure/:id/reorder
 */
export const reorderLines = async (req, res) => {
    try {
        const { id } = req.params;
        const { lotIds } = req.body; // IDs das linhas (subdocs) na nova ordem

        const closure = await SlaughterClosure.findById(id);
        if (!closure || closure.status === 'CLOSED') {
            return res.status(400).json({ success: false, message: 'Fechamento não encontrado ou já fechado' });
        }

        // Reordenar as linhas no array do documento
        const reorderedLines = [];
        for (let seqId of lotIds) {
            const line = closure.lines.id(seqId);
            if (line) reorderedLines.push(line);
        }

        // Atualizar sequências
        reorderedLines.forEach((line, idx) => {
            line.sequence = idx + 1;
        });

        closure.lines = reorderedLines;
        await closure.save();

        res.json({ success: true, data: closure });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Reabre fechamento SIF (Admin)
 * @route   POST /api/slaughter/closure/:id/reopen
 */
export const reopenClosure = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) return res.status(400).json({ success: false, message: 'Motivo da reabertura é obrigatório' });

        const closure = await SlaughterClosure.findById(id);
        if (!closure) return res.status(404).json({ success: false, message: 'Fechamento não encontrado' });

        closure.status = 'DRAFT';
        closure.closedBy = null;
        closure.closedAt = null;
        closure.reopenLog.push({
            by: req.user._id,
            reason
        });

        await closure.save();

        res.json({ success: true, message: 'Fechamento reaberto com sucesso' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Valida e fecha SIF
 * @route   POST /api/slaughter/closure/:id/close
 */
export const closeClosure = async (req, res) => {
    try {
        const { id } = req.params;
        const closure = await SlaughterClosure.findById(id);

        if (!closure) return res.status(404).json({ success: false, message: 'Fechamento não encontrado' });

        // Validações obrigatórias
        const incompleteRows = closure.lines.filter(l => !l.curral || !l.municipio || !l.uf);
        
        if (incompleteRows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Existem lotes com dados incompletos (Curral, Município ou UF)',
                data: incompleteRows.map(l => l.producerName)
            });
        }

        closure.status = 'CLOSED';
        closure.closedBy = req.user._id;
        closure.closedAt = new Date();
        await closure.save();

        res.json({ success: true, message: 'Boletim SIF fechado com sucesso' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Exporta PDF Boletim SIF
 * @route   GET /api/slaughter/closure/:id/pdf
 */
export const exportPdf = async (req, res) => {
    try {
        const { id } = req.params;
        const closure = await SlaughterClosure.findById(id);
        if (!closure) return res.status(404).json({ success: false, message: 'Fechamento não encontrado' });

        // Placeholder: Aqui viria a lógica de geração do PDF
        res.json({ success: true, message: 'Geração de PDF solicitada', url: `/uploads/si_bulletin_${id}.pdf` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Exporta XLSM oficial SIF
 * @route   GET /api/slaughter/closure/:id/export
 */
export const exportXlsm = async (req, res) => {
    try {
        const { id } = req.params;
        // Placeholder
        res.json({ success: true, message: 'Exportação XLSM em processamento' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Sincroniza o fechamento SIF com a escala de abate
 *          Chamado automaticamente quando a escala é alterada
 */
export const syncClosureWithSchedule = async (scheduleId) => {
    try {
        console.log(`Iniciando sincronização do fechamento para escala: ${scheduleId}`);
        const closure = await SlaughterClosure.findOne({ scheduleId });
        if (!closure) {
            console.log('Nenhum fechamento encontrado para esta escala.');
            return;
        }
        if (closure.status === 'CLOSED') {
            console.log('Fechamento já está encerrado (CLOSED). Ignorando sincronização.');
            return;
        }

        const schedule = await SlaughterSchedule.findById(scheduleId).populate('lots');
        if (!schedule) {
            console.log('Escala não encontrada.');
            return;
        }

        console.log(`Escala encontrada com ${schedule.lots?.length || 0} lotes.`);

        // Mapear linhas atuais para fácil acesso por preLotRefId
        const existingLinesMap = new Map();
        closure.lines.forEach(line => {
            if (line.preLotRefId) {
                existingLinesMap.set(line.preLotRefId.toString(), line);
            }
        });

        console.log(`Mapeadas ${existingLinesMap.size} linhas existentes.`);

        // Criar novas linhas baseadas nos lotes atuais, preservando dados manuais
        const newLines = (schedule.lots || [])
            .filter(lot => !lot.deletedAt)
            .map((lot, idx) => {
                const existing = existingLinesMap.get(lot._id.toString());
                
                if (existing) {
                    console.log(`Lote ${lot._id} já existia no SIF. Preservando dados.`);
                } else {
                    console.log(`Lote ${lot._id} é NOVO no SIF.`);
                }

                return {
                    sequence: idx + 1,
                    preLotRefId: lot._id.toString(),
                    producerName: lot.rancherName,
                    municipio: lot.municipio || (existing ? existing.municipio : ''),
                    uf: lot.uf || (existing ? existing.uf : ''),
                    boi: lot.boi || 0,
                    vaca: lot.vaca || 0,
                    novilha: lot.novilha || 0,
                    bubalino: lot.bubalino || 0,
                    touro: lot.touro || 0,
                    total: lot.total,
                    brokerCode: lot.brokerNumber,
                    // Preservar dados manuais do SIF
                    curral: existing ? existing.curral : '',
                    cor: existing ? existing.cor : '',
                    nf: existing ? existing.nf : '',
                    gta: existing ? existing.gta : '',
                    observations: existing ? existing.observations : ''
                };
            });

        closure.lines = newLines;
        await closure.save();

        console.log(`Fechamento SIF sincronizado com sucesso para escala ${scheduleId}. Total de linhas: ${newLines.length}`);
    } catch (error) {
        console.error('Erro na sincronização do fechamento:', error);
    }
};


