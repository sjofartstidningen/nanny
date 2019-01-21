const supportsWebp = ({
  Accept,
}: { [header: string]: string } = {}): boolean => {
  return !!Accept && Accept.includes('image/webp');
};

export { supportsWebp };
