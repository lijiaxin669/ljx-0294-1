import html2canvas from 'html2canvas';

export const exportToPNG = async (
  elementId: string,
  filename: string = '年夜饭座位图.png'
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, {
    backgroundColor: '#FAFAF0',
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
};
