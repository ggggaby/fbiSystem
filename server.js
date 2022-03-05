const express = require('express')
const app = express();
const users = require('./data/agentes').results;
const jwt = require('jsonwebtoken');
const secretKey = process.env['SECRET_KEY'];

app.listen(3000, () => console.log('Escuchando en el puerto 3000'));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send(__dirname + 'index.html')
});

app.get('/SignIn', (req, res) => {
    const { email, password } = req.query
    const user = users.find((u) => u.email === email && u.password === password);
    if (user) {
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + 120,
            data: user,
        },
            secretKey
        );
        res.send(`
        <a href="/RutaRestringida?token=${token}"> <p> Ruta Restrigida </p> </a>
        Bienvenido, ${email}.
        <script>
        localStorage.setItem('token', JSON.stringify("${token}"))
        </script>`
        )
    } else {
        res.send('Usuario o contraseña incorrecta')
    }
});

const verificar = (req, res, next) => {
    const { token } = req.query
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.status(401).send({
                error: '401 No autorizado',
                message: err.message,
            })
        } else {
            req.user = decoded
            next()
        }
    });
};
 
app.get('/RutaRestringida', verificar, (req, res) => {
    res.send(`Bienvenido ${req.user.data.email}`)
});

