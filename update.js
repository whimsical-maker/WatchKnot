require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const m = await prisma.movie.update({
    where: { id: 'cmqsnfriz0003ubjfli92mf0' },
    data: { videoUrl: 'https://vidsrc.me/embed/tv?tmdb=87108' } // Dummy TMDB for Dark if it's a TV show, but since it's added as a movie it works as a fallback
  });
  console.log('Movie updated:', m.videoUrl);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
