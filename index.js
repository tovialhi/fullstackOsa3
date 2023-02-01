

require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')


const app = express()
app.use(express.json())
app.use(express.static('build'))
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content', 'skip'))

morgan.token('content', function (req, res) {if (req.method === 'POST') return JSON.stringify(req.body) })




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

const generateId = () => {
    return Math.floor(Math.random() * (1000 - 1 + 1)) + 1
}


app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id).then(person => {
        res.json(person)
    })
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({ 
          error: 'content missing' 
        })
    }

    if (persons.some(person => person.name === body.name)) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

app.get('/api/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people</p>${new Date()}<p></p>`)
    })


const PORT = process.env.PORT
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})