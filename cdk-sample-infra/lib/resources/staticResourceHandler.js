const aws = require('aws-sdk')
const s3 = new aws.S3({apiVersion: '2006-03-01'})
const bucketName = process.env.FRONTEND_BUCKET
exports.handler = async function (event, context) {
    console.log(event)
    if (event.httpMethod !== 'GET') {
        const response = {
            statusCode: 405,
            statusDescription: '405 Method Not Allowed',
            isBase64Encoded: false,
            body: '',
        }
        console.log(response)
        context.succeed(response)
    }
    const key = event.path === '/' ? 'index.html' : event.path.substring(1)
    let s3Object
    try {
        s3Object = await s3.getObject({Bucket: bucketName, Key: key}).promise()
    } catch (e) {
        if (e.statusCode === 404) {
            // Supply index.html as a 404 error page
            s3Object = await s3.getObject({Bucket: bucketName, Key: 'index.html'}).promise()
        } else {
            console.error(e)
            throw new Error(`Error getting object ${key} from ${bucketName}`)
        }
    }
    let baseEncoded
    let content
    if (s3Object.ContentType.includes('image')) {
        baseEncoded = true
        content = s3Object.Body.toString('base64')
    } else {
        baseEncoded = false
        content = s3Object.Body.toString('utf-8')
    }
    const response = {
        statusCode: 200,
        statusDescription: '200 OK',
        isBase64Encoded: baseEncoded,
        body: content,
        headers: {'Content-Type': s3Object.ContentType}
    }
    console.log(response)
    context.succeed(response)
}
