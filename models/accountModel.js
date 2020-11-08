import mongoose from 'mongoose';

//criacao do modelo
const accountSchema = mongoose.Schema({
    agencia: {
        type: Number,
        require: true,
    },
    conta: {
        type: Number,
        require: true,
    },
    name: {
        type: String,
        require: true,
    },
    balance: {
        type: Number,
        require: true,
        // validate(value) {
        //     if (value < 0)
        //         throw new Error('Valor negativo para a nota nao permitido');
        // },
        min: 0, //usa a funcao de validacao ou defini minimo
    },
});

//definindo o modelo da colecao
const accountModel = mongoose.model('account', accountSchema);

export { accountModel };
