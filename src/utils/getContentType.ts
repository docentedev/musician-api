import path from 'path'

const getContentType = (file: any) => {
  const extension = path.extname(file)
  switch (extension) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.gif':
      return 'image/gif'
    case '.pdf':
      return 'application/pdf'
    case '.doc':
      return 'application/msword'
    default:
      return 'application/octet-stream'
  }
}

export default getContentType
