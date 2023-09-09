const express = require('express')

const fs = require('fs')
const path = require('path')
const multer = require('multer')

const app = express()
const port = 3001

// Middleware
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

// Configura multer para manejar las cargas de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Especifica el directorio de destino para el almacenamiento de archivos ('data' directory)
      const dataDirectory = 'data/';
      cb(null, dataDirectory);
    },
    filename: (req, file, cb) => {
      // Genera un nombre de archivo único (puedes personalizar esta lógica)
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

    // Construye el contenido del archivo TXT
    const contenidoArchivo = `id: ${id}\nnombre: ${nombre}\napellido: ${apellido}\ntitulo: ${titulo}\nautor: ${autor}\neditorial: ${editorial}\naño: ${anho}`
  
    // Crea el nombre del archivo TXT
    const nombreArchivo = `id_${id}.txt`
  
    // Escribe el contenido en el archivo
    fs.writeFile(path.join('data/', nombreArchivo), contenidoArchivo, (err) => {
      if (err) {
        console.error(err)
        return res.redirect('/error.html')
      }
  
      // Redirige al usuario a la página de descarga del archivo
      res.redirect(`/descargar/${id}`)
    })
  })
  
  // Ruta para descargar el archivo una vez validado y creado
  app.get('/descargar/:id', (req, res) => {
    const id = req.params.id

    const archivoPath = path.join(__dirname, 'data/', `id_${id}.txt`)
    // Verifica si el archivo existe
    if (fs.existsSync(archivoPath)) {
        // Configura las cabeceras de respuesta para la descarga del archivo
        res.setHeader('Content-disposition', `attachment; filename=id_${id}.txt`)
        res.setHeader('Content-type', 'text/plain')
        
        // Lee el archivo y envíalo como respuesta
        const archivoStream = fs.createReadStream(archivoPath)
        archivoStream.pipe(res)
        
        
    } else {
        res.status(404).send('El archivo no existe.')
    }
    
  })

app.listen(port, () => console.log('Funcionando con express'))
