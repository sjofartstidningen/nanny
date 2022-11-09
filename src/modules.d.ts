declare module 'animated-gif-detector' {
  function isAnimated(file: Buffer): boolean;
  export = isAnimated;
}
