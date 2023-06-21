export default function convertBase64(data) {
  const base64String = btoa(
    new Uint8Array(data).reduce(function (data, byte) {
      return data + String.fromCharCode(byte);
    }, "")
  );

  return `data:image/*;base64,${base64String}`;
}
