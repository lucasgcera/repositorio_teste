import express from 'express';
import mongoose from 'mongoose';
import { accountRouter } from './routes/accountRouter.js';

//conectar ao MongoDB pelo Mongoose
(async () => {
    try {
        await mongoose.connect(
            'mongodb+srv://userlucas:igtiuser@cluster0.7uu6j.mongodb.net/bank?retryWrites=true&w=majority',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        );
        console.log('Conectado no MongoDB com sucesso!');
    } catch (error) {
        console.log('Erro ao conectar no MongoDB');
    }
})();

const app = express();

app.use(express.json());
app.use(accountRouter);

app.listen(3000, () => console.log('API Iniciada'));
