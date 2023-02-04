
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Person = require('./models/person')

morgan.token('content', function (req) {if (req.method === 'POST') return JSON.stringify(req.body) })

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send( { error: 'malformatted id' } )
    }

    else if (error.name === 'ValidationError') {
        return res.status(400).json( { error: error.message } )
    }
    next(error)
}

const unknownEndpoint = (req, res) => {
    res.status(404).send( { error: 'unknown endpoint' } )
}

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content', 'skip'))


app.get('/api/persons', (req, res) => {
    Person.find( {} ).then(persons => {
        res.json(persons)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id).then(person => {
        if (person) {
            res.send(person)
        } else {
            res.status(404).end()
        }
    }).catch (error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body

    const person = new Person({
        name: body.name,
        number: body.number
    })

    Person.find( { name: body.name } ).then(result => {
        if (!result) {
            res.status(400).json( { error: 'name must be unique' } )
        }
        else {
            person.save().then(savedPerson => {
                res.json(savedPerson)
            }).catch(error => next(error))
        }
    })
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id).then(result => {
        console.log(result)
        res.status(204).end()
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body

    Person.findByIdAndUpdate(
        req.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' })
        .then(result => {
            res.json(result)
        }).catch(error => next(error))
})


app.get('/api/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${Person.count({})} people</p>${new Date()}<p></p>`)
})


app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})