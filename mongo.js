const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const nameArg = process.argv[3] || null
const numberArg = process.argv[4] || null

const url =
  `mongodb+srv://fullstov:${password}@cluster0.lyzds4f.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: nameArg,
  number: numberArg,
})

if (nameArg && numberArg) {
    person.save().then(() => {
        console.log(`added ${person.name} number ${person.number} to phonebook`)
        mongoose.connection.close()
      })
}

if (process.argv.length<4) {
    Person.find( {} ).then(result => {
        console.log('phonebook:')
        result.forEach(per => {
            console.log(`${per.name} ${per.number}`)
        })
      mongoose.connection.close()
    })
  }
