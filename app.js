const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 1. CONFIGURACIÓN DE MOTOR DE VISTAS (HBS)
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view options', { layout: 'layouts/main' });

// 2. MIDDLEWARES
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 3. RUTAS GET
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/dashboard', (req, res) => {
    try {
        const rawData = fs.readFileSync('data.json', 'utf-8');
        const proyecto = JSON.parse(rawData);
        res.render('dashboard', { tareas: proyecto.tareas });
    } catch (error) {
        res.render('dashboard', { tareas: [] });
    }
});

// 4. RUTA POST (Crear)
app.post('/nueva-tarjeta', (req, res) => {
    const { titulo, descripcion } = req.body;
    try {
        const rawData = fs.readFileSync('data.json', 'utf-8');
        const data = JSON.parse(rawData);
        const nuevaTarea = { id: Date.now(), titulo, descripcion };
        data.tareas.push(nuevaTarea);
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
        res.redirect('/dashboard');
    } catch (error) {
        res.redirect('/dashboard');
    }
}); 

// --- ELIMINAR TAREA  ---
app.post('/eliminar-tarjeta/:id', (req, res) => {
    const id = req.params.id;
    try {
        const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
        // Usar != para comparar string vs number por si acaso
        data.tareas = data.tareas.filter(t => t.id != id);
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
        res.redirect('/dashboard');
    } catch (error) {
        res.redirect('/dashboard');
    }
});

// --- EDITAR TAREA  ---
app.post('/editar-tarjeta/:id', (req, res) => {
    const id = req.params.id;
    const { nuevoTitulo } = req.body;
    try {
        const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
        const tarea = data.tareas.find(t => t.id == id);
        if (tarea) {
            tarea.titulo = nuevoTitulo || tarea.titulo;
        }
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
        res.redirect('/dashboard');
    } catch (error) {
        res.redirect('/dashboard');
    }
});

// --- PROCESAR REGISTRO (POST) ---
app.post('/register', (req, res) => {
    const { nombre, email, password } = req.body;
    try {
        const usuarios = JSON.parse(fs.readFileSync('usuarios.json', 'utf-8'));

        // Simular guardar el nuevo usuario
        const nuevoUsuario = { id: Date.now(), nombre, email, password };
        usuarios.push(nuevoUsuario);

        fs.writeFileSync('usuarios.json', JSON.stringify(usuarios, null, 2));

        // Después de registrarse, lo mandamos al login
        res.redirect('/login');
    } catch (error) {
        res.redirect('/register');
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    try {
        const usuarios = JSON.parse(fs.readFileSync('usuarios.json', 'utf-8'));
        const usuarioEncontrado = usuarios.find(u => u.email === email && u.password === password);

        if (usuarioEncontrado) {
            res.redirect('/dashboard');
        } else {
            res.render('login', { error: "Credenciales no válidas. Inténtalo de nuevo." });
        }
    } catch (error) {
        res.render('login', { error: "Error al conectar con la base de datos." });
    }
});

// 5. INICIO DEL SERVIDOR
app.listen(PORT, () => {
    console.log(`KanbanPro arrancando en http://localhost:${PORT}`);
});