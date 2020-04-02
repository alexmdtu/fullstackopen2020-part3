require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

let persons = [
    {
        name: "Arto Hellas",
        number: "01487621",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "39-44-5323523",
        id: 2
    },
    {
        name: "Dan Abramov",
        number: "12-43-234345",
        id: 3
    },
    {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 4
    }
]

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

morgan.token('person', (request, response) => {
    return JSON.stringify(request.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person', {
    skip: (req, res) => res.statusCode != 200
}))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
    skip: (req, res) => res.statusCode === 200
}))

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons.map(person => person.toJSON()))
    })
})

app.get('/info', (req, res) => {
    res.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
    `)
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id)
        .then(person => {
            response.json(person.toJSON())
        })
        .catch((error) => {
            response.status(404).end()
        })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const getRandomInt = () => {
    return Math.floor(Math.random() * 50000)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'person already exists'
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: getRandomInt(),
    }

    persons = persons.concat(person)

    response.json(person)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})