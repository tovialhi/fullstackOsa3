

const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Person = require('./models/person')


morgan.token('content', function (req, res) {if (req.method === 'POST') return JSON.stringify(req.body) })


const errorHandler = (error, req, res, next) => {
    console.error(error.message)
    
    if (error.name === 'CastError') {
        return res.status(400).send({error: 'malformatted id'})
    }
    next(error)
}

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: 'unknown endpoint'})
}


app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content', 'skip'))

let persons = [
{
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
},
{
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523"
},
{
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345"
},
{
    id: 4,
    name: "Mary Poppendick",
    number: "39-23-6423122"
}
]

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id).then(person => {
        if (person) {
            JSON.stringify(person)
        } else {
            res.status(404).end()
        }
    }).catch (error => next(error))
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({ 
          error: 'content missing' 
        })
    }

    Person.find({name: body.name}).then(result => {
        if (!result) {
            console.log('result:', result)
            res.status(400).json({error: 'name must be unique'})
        }
        else { 
            const person = new Person({
                name: body.name,
                number: body.number
            })
        
            person.save().then(savedPerson => {
                res.json(savedPerson)
            })
        }
    })

})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id).then(result => {
        res.status(204).end()
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    Person.findByIdAndUpdate(req.params.id, {number: body.number}).then(result => {
        res.json(result)
    }).catch(error => next(error))
    
})


app.get('/api/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${Person.find({}).length} people</p>${new Date()}<p></p>`)
    })


app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})