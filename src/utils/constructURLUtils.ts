// Inside utils/imageHelpers.ts

export function constructImageURL(imageName: string, recordId: string): string {
  const baseURL = 'https://petty-house.pockethost.io/api/files/';
  const collectionId = 'fbj6nkb0oiiajw3'; // Replace with your actual collection ID

  return `${baseURL}${collectionId}/${recordId}/${imageName}`;
}
