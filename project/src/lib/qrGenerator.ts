import QRCodeStyling from 'qr-code-styling'

export const generateRoomQR = (roomId: string): Promise<string> => {
  return new Promise((resolve) => {
    const qrCode = new QRCodeStyling({
      width: 200,
      height: 200,
      data: `${window.location.origin}/join/${roomId}`,
      dotsOptions: {
        color: '#8B5CF6',
        type: 'rounded'
      },
      backgroundOptions: {
        color: '#1F2937'
      },
      cornersSquareOptions: {
        color: '#06B6D4',
        type: 'extra-rounded'
      },
      cornersDotOptions: {
        color: '#F59E0B'
      }
    })

    qrCode.getRawData('png').then((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        resolve(url)
      }
    })
  })
}