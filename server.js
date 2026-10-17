const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PATH = process.env.ADMIN_PATH || 'secure-portal-auth-777';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'ChangeThisSecurePassword123!';
const ADMIN_QUIZ_ANSWER = process.env.ADMIN_QUIZ_ANSWER || 'Wanyama';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure directories exist
const dataDir = path.join(__dirname, 'data');
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// Copy local logo
const primaryLogoPath = '/storage/emulated/0/Download/nti.gpg';
const altLogoPath = '/storage/emulated/0/NTI posters/nti (1).jpg';
const destLogoPath = path.join(publicDir, 'nti.jpg');

try {
    if (fs.existsSync(primaryLogoPath)) {
        fs.copyFileSync(primaryLogoPath, destLogoPath);
    } else if (fs.existsSync(altLogoPath)) {
        fs.copyFileSync(altLogoPath, destLogoPath);
    }
} catch (err) {}

const postsFile = path.join(dataDir, 'posts.json');
const categoriesFile = path.join(dataDir, 'categories.json');
const settingsFile = path.join(dataDir, 'settings.json');

// Initialize default data
if (!fs.existsSync(postsFile)) {
    fs.writeFileSync(postsFile, JSON.stringify([
        {
            id: 1,
            order: 1,
            category: "WHAT IS NTI",
            title: "INTRODUCTION TO NAVAKHOLO TERRAHUB INITIATIVE",
            heading: "",
            content: "The Navakholo TerraHub Initiative (NTI) represents a pioneering decentralized economic machine designed to catalyze grassroots digital transformation in Kakamega County, Kenya.\n\n#(NTI is designed to empower youths and AI advancement without government bottlenecks)#.\n\n_(Built by youth, for the future)_.\n\nThis platform operates entirely on decentralized open infrastructure.",
            hidden: false,
            date: new Date().toISOString()
        }
    ], null, 2));
}

if (!fs.existsSync(categoriesFile)) {
    fs.writeFileSync(categoriesFile, JSON.stringify([
        "WHAT IS NTI",
        "WHY WAS IT INVENTED",
        "WHAT HAS/WILL IT CHANGE",
        "COMPARISON OF NTI WITH OLD SYSTEMS",
        "HISTORY BEHIND NTI",
        "WHY IS NTI POWERFUL",
        "POLICIES AND RULES",
        "NTI DIVISIONS OR CATEGORIES UNDER NTI",
        "WHAT IS NTI-ETL10 AND NTI-MBRS",
        "WHAT'S WANYAMA'S TIME COMPRESSION THEOREM"
    ], null, 2));
}

if (!fs.existsSync(settingsFile)) {
    fs.writeFileSync(settingsFile, JSON.stringify({
        facebook: "https://facebook.com",
        github: "https://github.com",
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com"
    }, null, 2));
}

function getPosts() { try { return JSON.parse(fs.readFileSync(postsFile, 'utf8')); } catch (e) { return []; } }
function savePosts(posts) { fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2)); }
function getCategories() { try { return JSON.parse(fs.readFileSync(categoriesFile, 'utf8')); } catch (e) { return []; } }
function saveCategories(cat) { fs.writeFileSync(categoriesFile, JSON.stringify(cat, null, 2)); }
function getSettings() { try { return JSON.parse(fs.readFileSync(settingsFile, 'utf8')); } catch (e) { return {}; } }
function saveSettings(set) { fs.writeFileSync(settingsFile, JSON.stringify(set, null, 2)); }

// Compact Custom NTI Text Formatter Parser
function parseCustomText(text) {
    if (!text) return '';
    return text
        .replace(/###\((.*?)\)###/g, '<h2 class="text-lg md:text-xl font-bold gold-text mt-3 mb-1 uppercase tracking-wide">$1</h2>')
        .replace(/##\((.*?)\)##/g, '<h3 class="text-base md:text-lg font-semibold text-yellow-300 mt-2 mb-1">$1</h3>')
        .replace(/#\((.*?)\)#/g, '<strong class="font-bold text-white">$1</strong>')
        .replace(/_\((.*?)\)_/g, '<em class="italic text-zinc-300">$1</em>')
        .replace(/12_font\((.*?)\)12_font/g, '<span style="font-family: \'Times New Roman\', Times, serif; font-size: 12pt;">$1</span>')
        .replace(/blue_color\((.*?)\)blue_color/g, '<span class="text-blue-400">$1</span>')
        .replace(/green_color\((.*?)\)green_color/g, '<span class="text-green-400">$1</span>')
        .replace(/red_color\((.*?)\)red_color/g, '<span class="text-red-400">$1</span>')
        .replace(/cyan_color\((.*?)\)cyan_color/g, '<span class="text-cyan-400">$1</span>')
        .replace(/\n\n/g, '</p><p class="mt-2.5">')
        .replace(/\n/g, '<br>');
}

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get(`/${ADMIN_PATH}`, (req, res) => res.sendFile(path.join(__dirname, 'public', 'secure-portal-auth-777.html')));

app.get('/api/posts', (req, res) => {
    const posts = getPosts().sort((a, b) => a.order - b.order).map(p => ({
        ...p,
        parsedContent: `<p>${parseCustomText(p.content)}</p>`
    }));
    res.json(posts);
});

app.get('/api/categories', (req, res) => res.json(getCategories()));
app.get('/api/settings', (req, res) => res.json(getSettings()));

app.post('/api/admin/login', (req, res) => {
    const { username, password, quizAnswer } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS && quizAnswer.trim().toLowerCase() === ADMIN_QUIZ_ANSWER.toLowerCase()) {
        res.json({ success: true, token: 'nti_secret_auth_token_2026' });
    } else {
        res.status(401).json({ success: false });
    }
});

app.post('/api/admin/verify', (req, res) => {
    if (req.body.token === 'nti_secret_auth_token_2026') res.json({ success: true });
    else res.status(401).json({ success: false });
});

app.post('/api/admin/categories', (req, res) => {
    if (req.body.token !== 'nti_secret_auth_token_2026') return res.status(403).json({ success: false });
    const categories = getCategories();
    if (req.body.category && !categories.includes(req.body.category.trim())) {
        categories.push(req.body.category.trim().toUpperCase());
        saveCategories(categories);
    }
    res.json({ success: true, categories });
});

app.post('/api/admin/posts', (req, res) => {
    if (req.body.token !== 'nti_secret_auth_token_2026') return res.status(403).json({ success: false });
    const posts = getPosts();
    posts.push({
        id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
        order: posts.length + 1,
        category: req.body.category,
        title: req.body.title,
        heading: req.body.heading || '',
        content: req.body.content,
        hidden: false,
        date: new Date().toISOString()
    });
    savePosts(posts);
    res.json({ success: true });
});

app.post('/api/admin/posts/:id/hide', (req, res) => {
    if (req.body.token !== 'nti_secret_auth_token_2026') return res.status(403).json({ success: false });
    const posts = getPosts();
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (post) { post.hidden = !post.hidden; savePosts(posts); }
    res.json({ success: true });
});

app.post('/api/admin/posts/:id/order', (req, res) => {
    if (req.body.token !== 'nti_secret_auth_token_2026') return res.status(403).json({ success: false });
    const posts = getPosts();
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (post) { post.order = parseInt(req.body.order); savePosts(posts); }
    res.json({ success: true });
});

app.delete('/api/admin/posts/:id', (req, res) => {
    if (req.body.token !== 'nti_secret_auth_token_2026') return res.status(403).json({ success: false });
    savePosts(getPosts().filter(p => p.id !== parseInt(req.params.id)));
    res.json({ success: true });
});

app.post('/api/admin/settings', (req, res) => {
    if (req.body.token !== 'nti_secret_auth_token_2026') return res.status(403).json({ success: false });
    saveSettings({ facebook: req.body.facebook, github: req.body.github, instagram: req.body.instagram, linkedin: req.body.linkedin });
    res.json({ success: true });
});

// Dynamic Sitemap XML Route (Auto-detects matching domain)
app.get('/sitemap.xml', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    res.header('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/dashboard</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
</urlset>`);
});

app.listen(PORT, () => console.log(`NTI Server running on port ${PORT}`));
