import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome do produto é obrigatório'],
        trim: true
    },
    description: {
        type: String
    },
    category: {
        type: String,
        required: [true, 'Categoria é obrigatória']
    },
    quantity: {
        type: Number,
        default: 0
    },
    unit: {
        type: String,
        default: 'un'
    },
    minQuantity: {
        type: Number,
        default: 0
    },
    location: {
        type: String
    },
    company: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;
