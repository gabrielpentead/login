const express = require('express');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');

// Inicializar o express
const app = express();

// Configura EJS 
app.set('view engine', 'ejs'); 
app.set('views', __dirname + '/views'); 

// Serve arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Middleware 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessions({
    secret: 'minhachave', 
    resave: false, // Evita gravar sessões sem alterações
    saveUninitialized: true // Salvar na guia anônima
}));

// Middleware de autenticação
function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return next();
    }
    res.redirect('/login');
}

// Rota para exibir o formulário de login
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Rota para efetuar o login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

   
    if (username === 'engenharia' && password === 'senha123') {
        req.session.isAuthenticated = true;
        req.session.username = username;

        // Setando um cookie
        res.cookie('loggedIn', 'true', { maxAge: 900000, httpOnly: true });

        // Define um tempo de expiração para a sessão de 1 minuto
        req.session.cookie.expires = new Date(Date.now() + 60000); 

        res.redirect('/dashboard');
    } else {
        res.render('login', { error: 'Credenciais inválidas' });
    }
});

// Rota protegida
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', { username: req.session.username });
});

// Rota de logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.clearCookie('loggedIn');
        res.redirect('/login');
    });
});

// Iniciar o servidor
app.listen(8080, () => {
    console.log('Servidor rodando na porta 8080');
});
