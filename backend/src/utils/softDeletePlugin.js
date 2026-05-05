import mongoose from 'mongoose';

const softDeletePlugin = (schema) => {
    schema.add({
        deletedAt: {
            type: Date,
            default: null,
            index: true
        }
    });

    const filterDeleted = function (next) {
        if (!this.getOptions().includeDeleted) {
            this.where({ deletedAt: null });
        }
        next();
    };

    // Aplicar filtro em métodos de busca
    schema.pre('find', filterDeleted);
    schema.pre('findOne', filterDeleted);
    schema.pre('findOneAndUpdate', filterDeleted);
    schema.pre('countDocuments', filterDeleted);

    // Método para deletar suavemente
    schema.methods.softDelete = function () {
        this.deletedAt = new Date();
        return this.save();
    };

    // Método estático para restaurar
    schema.statics.restore = function (id) {
        return this.findOneAndUpdate(
            { _id: id },
            { deletedAt: null },
            { new: true, includeDeleted: true }
        );
    };
};

export default softDeletePlugin;
