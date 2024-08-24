# pixel-font

Many modern font formats are scalable vectors, which is a wonderful advancement for ever-growing screen sizes.
However, oftentimes fonts designed for larger screens do not look great when targeting systems with miniscule screen sizes.
This program allows for the creation of fonts through individual pixels,
along with exporting to a ROM format for small devices such as homebrew GPUs and Arduinos.

To run this, you will need `npm`, `npx`, and `cargo` installed.
First, we need to build the frontend.
To do this, run the following commands in the `frontend` directory:

```bash
npm install
npm run build
```

After the frontend is built, set the `FONT_FRONTEND` environment variable to the path to the `frontend` directory,
then run the following command in the `backend` directory:

```bash
cargo run
```
