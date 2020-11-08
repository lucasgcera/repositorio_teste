/* imports necessarios para a aplicacao */
import express from 'express';
import mongoose from 'mongoose';
import { accountRouter } from './routes/accountRouter.js';
import dotenv from 'dotenv';

dotenv.config();

//conectar ao MongoDB pelo Mongoose
(async () => {
    try {
        await mongoose.connect(
            `mongodb+srv://${process.env.USERDB}:${process.env.PWDDB}@cluster0.7uu6j.mongodb.net/bank?retryWrites=true&w=majority`,
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

app.use(express.json()); //defini para a API usar arquivos JSON
app.use(accountRouter); //adicionando arquivos com as rotas para a API

app.listen(process.env.PORT, () => console.log('API Iniciada')); //iniciando API na porta 3000
