const express = require('express')

const fs = require('fs')
const path = require('path')
const multer = require('multer')

const app = express()
const port = 3001

// Middleware
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dataDirectory = 'data/';
      cb(null, dataDirectory);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  })

const upload = multer({ storage })

app.post('/formulario', upload.single('file'), (req, res) => {
    console.log(req.body)
    const { id, nombre, apellido, titulo, autor, editorial, anho } = req.body
  
    if (!id || !nombre || !apellido || !titulo || !autor || !editorial || !anho) {
      return res.redirect('/error.html')
    }
    // res.send(`Datos enviados... ${id} - ${nombre} - ${apellido} - ${titulo} - ${autor} - ${editorial} - ${anho}.`);

    const contenidoArchivo = `id: ${id}\nnombre: ${nombre}\napellido: ${apellido}\ntitulo: ${titulo}\nautor: ${autor}\neditorial: ${editorial}\naño: ${anho}`
  
    const nombreArchivo = `id_${id}.txt`
  
    fs.writeFile(path.join('data/', nombreArchivo), contenidoArchivo, (err) => {
      if (err) {
        console.error(err)
        return res.redirect('/error.html')
      }
  
      res.redirect(`/descargar/${id}`)
    })
  })
  
  app.get('/descargar/:id', (req, res) => {
    const id = req.params.id

    const archivoPath = path.join(__dirname, 'data/', `id_${id}.txt`)
    if (fs.existsSync(archivoPath)) {
        res.setHeader('Content-disposition', `attachment; filename=id_${id}.txt`)
        res.setHeader('Content-type', 'text/plain')
        
        const archivoStream = fs.createReadStream(archivoPath)
        archivoStream.pipe(res)
        
    } else {
        res.status(404).send('El archivo no existe.')
    }
    
  })

app.listen(port, () => console.log('Funcionando con express'))
