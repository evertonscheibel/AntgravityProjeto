import CicloProcesso from '../models/CicloProcesso.js';

// @desc    Obter dashboard de processos
export const getProcessosDashboard = async (req, res) => {
    try {
        const { fazenda_id } = req.query;
        let query = { company: req.user.company };
        if (fazenda_id) query.fazenda_id = fazenda_id;

        const [kpis, porMes, tempoMedio] = await Promise.all([
            CicloProcesso.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        totalCiclos: { $sum: 1 },
                        totalConcluidos: { $sum: { $cond: [{ $eq: ['$status', 'concluido'] }, 1, 0] } },
                        tempoMedioDias: { $avg: '$duracao_dias' },
                        custoMedio: { $avg: '$custo_realizado' }
                    }
                }
            ]),
            CicloProcesso.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: { $month: '$data_inicio' },
                        ciclos: { $sum: 1 }
                    }
                },
                { $sort: { '_id': 1 } }
            ]),
            CicloProcesso.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$processo_id',
                        media: { $avg: '$duracao_dias' }
                    }
                },
                { $lookup: { from: 'processes', localField: '_id', foreignField: '_id', as: 'processo' } },
                { $unwind: '$processo' }
            ])
        ]);

        res.json({
            success: true,
            data: {
                kpis: kpis[0] || {},
                porMes,
                tempoMedio
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Listar ciclos de processo
export const getCiclosProcesso = async (req, res) => {
    try {
        const query = { company: req.user.company };
        const ciclos = await CicloProcesso.find(query)
            .populate('processo_id', 'title')
            .populate('responsavel_id', 'name')
            .sort({ data_inicio: -1 });

        res.json({ success: true, data: ciclos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Criar novo ciclo
export const createCicloProcesso = async (req, res) => {
    try {
        const ciclo = await CicloProcesso.create({
            ...req.body,
            company: req.user.company
        });
        res.status(201).json({ success: true, data: ciclo });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Rendimento da equipe
export const getRendimentoEquipe = async (req, res) => {
    try {
        const query = { company: req.user.company, status: 'concluido' };
        const rendimento = await CicloProcesso.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$responsavel_id',
                    ciclos: { $sum: 1 },
                    notaMedia: { $avg: '$avaliacao_coordenador' },
                    tempoMedio: { $avg: '$duracao_dias' }
                }
            },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'usuario' } },
            { $unwind: '$usuario' }
        ]);

        res.json({ success: true, data: rendimento });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
