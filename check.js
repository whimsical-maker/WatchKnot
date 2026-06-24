const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const m = await prisma.movie.findUnique({
    where: { id: 'cmqsnfriz0003ubjfli92mf0' }
  });
  console.log('Movie ID:', m?.id);
  console.log('Title:', m?.title);
  console.log('Video URL:', m?.videoUrl);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
