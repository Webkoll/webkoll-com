const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

console.log('Starting content build script...');

function generateContent() {
    const portfolioDir = '_portfolio';
    const blogDir = '_blog';
    const settingsFile = '_data/settings.json';
    const outputApiDir = 'api';
    const outputApiFile = path.join(outputApiDir, 'content.json');

    try {
        // --- Ellenőrizzük a mappák és fájlok létezését ---
        if (!fs.existsSync(portfolioDir)) {
            console.warn(`Portfolio directory not found: ${portfolioDir}. Skipping portfolio items.`);
            fs.mkdirSync(portfolioDir, { recursive: true });
        }
        if (!fs.existsSync(blogDir)) {
            console.warn(`Blog directory not found: ${blogDir}. Skipping blog posts.`);
            fs.mkdirSync(blogDir, { recursive: true });
        }
        if (!fs.existsSync(path.dirname(settingsFile))) {
             fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
        }
        if (!fs.existsSync(settingsFile)) {
            console.warn(`Settings file not found: ${settingsFile}. Using empty settings.`);
            // Hozzunk létre egy üres settings fájlt, ha nem létezik
            fs.writeFileSync(settingsFile, JSON.stringify({
                contact: {},
                quote_options: []
            }, null, 2));
        }

        // --- Kimeneti mappa létrehozása ---
        if (!fs.existsSync(outputApiDir)) {
            fs.mkdirSync(outputApiDir);
            console.log(`Created directory: ${outputApiDir}`);
        }

        // --- Portfólió elemek feldolgozása ---
        const portfolioFiles = fs.readdirSync(portfolioDir).filter(f => f.endsWith('.md'));
        const portfolioData = portfolioFiles.map(filename => {
            const slug = path.parse(filename).name;
            const fileContent = fs.readFileSync(path.join(portfolioDir, filename), 'utf8');
            const { data, content } = matter(fileContent);
            return { id: slug, ...data, body: content };
        });
        console.log(`Processed ${portfolioData.length} portfolio items.`);

        // --- Blog bejegyzések feldolgozása ---
        const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
        const blogData = blogFiles.map(filename => {
            const slug = path.parse(filename).name;
            const fileContent = fs.readFileSync(path.join(blogDir, filename), 'utf8');
            const { data, content } = matter(fileContent);
            const date = new Date(data.date);
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            return { id: slug, ...data, date: formattedDate, body: content };
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log(`Processed ${blogData.length} blog posts.`);
        
        // --- Adatok összeállítása ---
        const apiData = {
            portfolio: portfolioData,
            blog: blogData
        };

        // --- API fájl megírása ---
        fs.writeFileSync(outputApiFile, JSON.stringify(apiData, null, 2));
        console.log(`Content API generated successfully at ${outputApiFile}`);

    } catch (error) {
        console.error('Error during content build:', error);
        process.exit(1); // Kilépés hibakóddal, hogy a Netlify build leálljon
    }
}

generateContent();