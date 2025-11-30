import app from './app';

const PORT =5000;

async function main() {
  app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
}

main();
