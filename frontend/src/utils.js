
export function convertToReadableSize(size, is_file) {
  if (!is_file) return `${size}`;
  if (size < 1_024) return `${size} B`;

  const divider = 1_024;
  size /= divider; // 8 to convert from bit to byte
  if (size < 1_024)
    return `${size.toFixed(2)} KB`;
  
  size /= divider;
  if (size < 1_024)
    return `${size.toFixed(2)} MB`;

  size /= divider;
  return `${size.toFixed(2)} GB`;
}
