import Vacancy from '../models/Vacancy.js';
import Candidate from '../models/Candidate.js';

// ============ Vacancies ============
export const getVacancies = async (req, res) => {
    try {
        const vacancies = await Vacancy.find({ company: req.user.company || 'default' }).sort({ createdAt: -1 });
        res.json({ success: true, data: vacancies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createVacancy = async (req, res) => {
    try {
        const vacancy = await Vacancy.create({
            ...req.body,
            company: req.user.company || 'default',
            createdBy: req.user._id
        });
        res.status(201).json({ success: true, data: vacancy });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateVacancy = async (req, res) => {
    try {
        const vacancy = await Vacancy.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!vacancy) return res.status(404).json({ success: false, message: 'Vaga não encontrada' });
        res.json({ success: true, data: vacancy });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteVacancy = async (req, res) => {
    try {
        const vacancy = await Vacancy.findByIdAndDelete(req.params.id);
        if (!vacancy) return res.status(404).json({ success: false, message: 'Vaga não encontrada' });
        // Delete related candidates? (Optional policy)
        await Candidate.deleteMany({ vacancy: req.params.id });
        res.json({ success: true, message: 'Vaga e candidatos relacionados excluídos' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============ Candidates ============
export const getCandidates = async (req, res) => {
    try {
        const { vacancyId } = req.query;
        const query = { company: req.user.company || 'default' };
        if (vacancyId) query.vacancy = vacancyId;

        const candidates = await Candidate.find(query).populate('vacancy', 'title').sort({ createdAt: -1 });
        res.json({ success: true, data: candidates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.create({
            ...req.body,
            company: req.user.company || 'default'
        });
        res.status(201).json({ success: true, data: candidate });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!candidate) return res.status(404).json({ success: false, message: 'Candidato não encontrado' });
        res.json({ success: true, data: candidate });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findByIdAndDelete(req.params.id);
        if (!candidate) return res.status(404).json({ success: false, message: 'Candidato não encontrado' });
        res.json({ success: true, message: 'Candidato excluído' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
