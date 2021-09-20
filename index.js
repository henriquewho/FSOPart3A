// require express and put it on 'app'
require('dotenv').config(); 
const express = require('express')
let morgan = require('morgan'); 
const cors = require('cors'); 
const app = express(); 

const Person = require('./models/person')

app.use(cors()); 
app.use(express.json())
//app.use(morgan('tiny'))
app.use(express.static('build')); 

morgan.token('data', request => {
    return JSON.stringify(request.body); 
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data')); 

// 'database '
let persons = [
    { id: 1, name: 'john doe', number: 12345 },
    { id: 2, name: 'janne doe', number: 54321 },
]

const genId = () =>{
    let newId = Math.floor(Math.random()*1000); 
    while (persons.find(each=>each.id === newId)){
        newId = Math.floor(Math.random()*1000); 
    }
    return newId; 
}

// routes db
app.get('/api/persons', (request, response)=>{
    console.log('request for all persons');
    Person.find({}).then(result=>{
        response.json(result); 
    })
})

app.get('/api/persons/:id', (request, response)=>{
    Person.findById(request.params.id).then(result=>{
        console.log(`Found the person with id ${request.params.id}`);
        response.json(result); 
    })
})

app.get('/info', (request, response)=>{
    Person.find({}).then(result=>{
        const now = new Date(); 
        const string = `<p>Phonebook has info for ${result.length} people</p>
        <p>${now}</p>`; 
        response.send(string); 
    })
})

app.post('/api/persons', (request, response)=>{
    console.log(`adding a new person`);
    const data = request.body; 
    const number = +data.phone || +data.number; 

    if (persons.find(each=>each.name === data.name)){
        const err = {error: 'Name must be unique'}; 
        return response.status(400).send(err); 
    } else if (data.name=="" || !data.name){
        const err = {error: 'Person needs a name'}
        return response.status(400).send(err); 
    } else if (!number || number<1){
        const err = {error: `Number must be valid, ${number}`};
        return response.status(400).send(err); 
    }

    const newPerson = Person({
        name: data.name, 
        number: number
    })
    newPerson.save().then(result =>{
        console.log(`${newPerson.name} was added to the db`);
        response.json(result);
    })
})

// older routes
app.delete('/api/persons/:id', (request, response) => {
    const id = +request.params.id;
    if (persons.find(each=>each.id===id)){
        persons = persons.filter(each=>each.id!==id); 
        response.status(200).end(); 
    } else {
        response.status(404).end(); 
    }
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// define port and tell app to listen at it
const PORT = process.env.PORT || 3001; 
app.listen(PORT); 


