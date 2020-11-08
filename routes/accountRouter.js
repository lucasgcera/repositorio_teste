import express from 'express';
import { accountModel } from '../models/accountModel.js';

const app = express();

//RETRIEVE
app.get('/accounts', async (req, res) => {
    try {
        const accounts = await accountModel.find({});
        res.send(accounts);
    } catch (error) {
        res.status(500).send(error);
    }
});

//DEPOSITO
app.patch('/deposito/:agencia/:nrconta/:valor', async (req, res) => {
    try {
        const { agencia, nrconta, valor } = req.params;
        const account = await accountModel.findOne({
            agencia: agencia,
            conta: nrconta,
        });

        if (!account) {
            res.status(404).send('Conta não encontrada na coleção');
        } else {
            const saldoAtual = account.balance + parseFloat(valor);

            await accountModel.updateOne(
                { _id: account._id },
                { balance: saldoAtual }
            );

            res.status(200).send(`O saldo atual da conta é: ${saldoAtual}`);
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

//SAQUE
app.patch('/saque/:agencia/:nrconta/:valor', async (req, res) => {
    try {
        const { agencia, nrconta, valor } = req.params;
        const account = await accountModel.findOne({
            agencia: agencia,
            conta: nrconta,
        });

        if (!account) {
            res.status(404).send('Conta não encontrada na coleção');
        } else {
            const saldoAtual = account.balance - parseFloat(valor) - 1;

            if (saldoAtual < 0) {
                res.status(500).send('Saldo da conta é insuficiente!');
            } else {
                await accountModel.updateOne(
                    { _id: account._id },
                    { balance: saldoAtual }
                );

                res.status(200).send(`O saldo atual da conta é: ${saldoAtual}`);
            }
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

//SALDO
app.get('/saldo/:agencia/:nrconta', async (req, res) => {
    try {
        const { agencia, nrconta } = req.params;
        const account = await accountModel.findOne({
            agencia: agencia,
            conta: nrconta,
        });

        if (!account) {
            res.status(404).send('Conta não encontrada na coleção');
        } else {
            res.status(200).send(`O saldo da conta é: ${account.balance}`);
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

//EXCLUIR CONTA
app.delete('/account/:agencia/:nrconta', async (req, res) => {
    try {
        const { agencia, nrconta } = req.params;
        const account = await accountModel.deleteOne({
            agencia: agencia,
            conta: nrconta,
        });

        if (!account) {
            res.status(404).send('Conta não encontrada na coleção');
        } else {
            accountModel.count({ agencia: agencia }, (err, count) => {
                if (err) {
                    res.status(500).send(
                        `Erro ao verificar quantidade de contas ativas da agencia ${agencia}`
                    );
                } else {
                    res.status(200).send(
                        `A quantidade de contas ativas para a agencia ${agencia} é: ${count}`
                    );
                }
            });
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

//TRANSFERENCIA
app.patch(
    '/transferencia/:contaorigem/:contadestino/:valor',
    async (req, res) => {
        try {
            const { contaorigem, contadestino, valor } = req.params;

            const contaOrigem = await accountModel.findOne({
                conta: contaorigem,
            });
            const contaDestino = await accountModel.findOne({
                conta: contadestino,
            });

            if (!contaOrigem || !contaDestino) {
                res.status(404).send(
                    'Conta Origem ou Destino não encontrada na coleção'
                );
            } else {
                let saldoAtualOrigem = contaOrigem.balance - parseFloat(valor);
                let saldoAtualDestino =
                    contaDestino.balance + parseFloat(valor);

                if (contaOrigem.agencia !== contaDestino.agencia) {
                    saldoAtualOrigem -= 8;
                }

                if (saldoAtualOrigem < 0) {
                    res.status(500).send('Saldo da conta é insuficiente!');
                } else {
                    await accountModel.updateOne(
                        { _id: contaOrigem._id },
                        { balance: saldoAtualOrigem }
                    );
                    await accountModel.updateOne(
                        { _id: contaDestino._id },
                        { balance: saldoAtualDestino }
                    );

                    res.status(200).send(
                        `O saldo atual da conta origem é: ${saldoAtualOrigem}`
                    );
                }
            }
        } catch (error) {
            res.status(500).send(error);
        }
    }
);

//MEDIA DE SALDOS
app.get('/media/:agencia', async (req, res) => {
    try {
        const agencia = parseFloat(req.params.agencia);

        accountModel
            .aggregate([
                { $match: { agencia: agencia } },
                { $group: { _id: null, avgBalance: { $avg: '$balance' } } },
                { $project: { _id: 0, avgBalance: 1 } },
            ])
            .then(function (result) {
                res.status(200).send(
                    `A média do saldo das contas da agencia ${agencia} é de: ${result[0].avgBalance.toFixed(
                        2
                    )}`
                );
            });
    } catch (error) {
        res.status(500).send(error);
    }
});

//MENORES DE SALDOS
app.get('/menores/:qtdcontas', async (req, res) => {
    try {
        const qtdContas = parseInt(req.params.qtdcontas);

        const accounts = await accountModel
            .find({})
            .sort({ balance: 1 })
            .limit(qtdContas);

        res.send(accounts);
    } catch (error) {
        res.status(500).send(error);
    }
});

//MAIORES DE SALDOS
app.get('/maiores/:qtdcontas', async (req, res) => {
    try {
        const qtdContas = parseInt(req.params.qtdcontas);

        const accounts = await accountModel
            .find({})
            .sort({ balance: -1 })
            .limit(qtdContas);

        res.send(accounts);
    } catch (error) {
        res.status(500).send(error);
    }
});

//TRANSFERIR RICOS
app.get('/transferirricos', async (req, res) => {
    try {
        accountModel
            .aggregate([
                {
                    $group: {
                        _id: '$agencia',
                        maxBalance: { $max: '$balance' },
                    },
                },
                { $project: { _id: 1, agencia: 1, maxBalance: 1 } },
            ])
            .then(function (result) {
                console.log(result);
                res.status(200).send(result);
            });
    } catch (error) {
        res.status(500).send(error);
    }
});

export { app as accountRouter };
