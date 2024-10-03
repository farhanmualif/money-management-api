export function parsePrismaError(errorMessage) {
  // Ekstrak nama fungsi Prisma yang diinvokasi
  const functionMatch = errorMessage.match(/Invalid `(.+?)` invocation:/);
  const prismaFunction = functionMatch
    ? functionMatch[1]
    : 'Unknown Prisma function';

  // Ekstrak data yang dikirim
  const dataMatch = errorMessage.match(/{\n([\s\S]*?)\n}/);
  const dataSent = dataMatch ? dataMatch[1].trim() : 'No data found';

  // Ekstrak field yang hilang atau error
  const missingFieldMatch = errorMessage.match(/Argument `(.+?)` is missing./);
  const missingField = missingFieldMatch ? missingFieldMatch[1] : null;

  // Buat pesan error yang lebih mudah dibaca
  let readableError = `Error in ${prismaFunction}:\n`;
  if (missingField) {
    readableError += `Missing required field: ${missingField}\n`;
  } else {
    readableError += 'Invalid data provided\n';
  }
  readableError += `Data sent:\n${dataSent}`;

  return {
    prismaFunction,
    dataSent,
    missingField,
    readableError,
  };
}
