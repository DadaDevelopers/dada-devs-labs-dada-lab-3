export default async function generateUploadUrl({ fileName, mimeType }) {
  return {
    uploadUrl: "https://example.com/upload-stub",
    fileUrl: `https://example.com/files/${fileName}`
  };
}
