import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const chessTags = [
    { name: 'mate-in-1', label: 'Мат в 1 хід' },
    { name: 'mate-in-2', label: 'Мат в 2 ходи' },
    { name: 'mate-in-3', label: 'Мат в 3 ходи' },
    { name: 'mate-in-4', label: 'Мат в 4 ходи' },
    { name: 'mate-in-5', label: 'Мат в 5 ходи' },
    { name: 'mate-by-pawn', label: 'Мат пішаком' },
    { name: 'mate-by-knight', label: 'Мат конем' },
    { name: 'mate-by-bishop', label: 'Мат слоном' },
    { name: 'mate-by-rook', label: 'Мат турою' },
    { name: 'mate-by-queen', label: 'Мат ферзем' },

    { name: 'discovered-attack', label: 'Відкритий напад' },
    { name: 'double-check', label: 'Подвійний шах' },
    { name: 'attraction', label: 'Заманювання' },
    { name: 'distraction', label: 'Відволікання' },

    { name: 'fork', label: 'Вилка' },
    { name: 'pin', label: "Зв'язка" },
    { name: 'skewer', label: 'Лінійний удар' },
    { name: 'interference', label: 'Перекриття' },
    { name: 'x-ray', label: 'Рентген' },
    { name: 'overloading', label: 'Перевантаження' },
    { name: 'zwischenzug', label: 'Проміжний хід)' },
    { name: 'destruction', label: 'Руйнування' },

    { name: 'opening', label: 'Дебют' },
    { name: 'middlegame', label: 'Міттельшпіль' },
    { name: 'endgame', label: 'Ендшпіль' },
    { name: 'pawn-endgame', label: 'Пішаковий ендшпіль' },
    { name: 'rook-endgame', label: 'Туровий ендшпіль' },
    { name: 'queen-endgame', label: 'Ферзевий ендшпіль' },
    { name: 'knight-endgame', label: 'Коневий ендшпіль' },
    { name: 'bishop-endgame', label: 'Слоновий ендшпіль' },

    { name: 'hanging-piece', label: 'Незахищена фігура' },
  ];

  for (const tag of chessTags) {
    await prisma.puzzleTag.upsert({
      where: { name: tag.name },
      update: { label: tag.label },
      create: {
        name: tag.name,
        label: tag.label,
      },
    });
  }
  console.log(`Успішно додано/оновлено ${chessTags.length} шахових тегів!`);
}

main()
  .catch((e) => {
    console.error('Помилка під час виконання сід-скрипту:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
