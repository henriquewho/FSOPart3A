// require express and put it on 'app'
const { application, request, response } = require('express');
const express = require('express')
let morgan = require('morgan'); 
const cors = require('cors'); 
const app = express(); 

app.use(cors()); 
app.use(express.json())
//app.use(morgan('tiny'))

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

// routes 
app.get('/api/persons', (request, response)=>{
    console.log('request for all persons');
    response.json(persons); 
})

app.get('/api/persons/:id', (request, response)=>{
    const id = +request.params.id; 
    const person = persons.find(each => each.id === id); 

    if (person){
        console.log('person found', person);
        response.json(person);
    } else {
        console.log('person not found, return 404')
        response.status(404).end(); 
    }
})

app.get('/info', (request, response)=>{
    const now = new Date(); 
    const string = `<p>Phonebook has info for ${persons.length} people</p>
    <p>${now}</p>`; 
    response.send(string); 
})

app.delete('/api/persons/:id', (request, response) => {
    const id = +request.params.id;
    if (persons.find(each=>each.id===id)){
        persons = persons.filter(each=>each.id!==id); 
        response.status(200).end(); 
    } else {
        response.status(404).end(); 
    }
})

app.post('/api/persons', (request, response)=>{
    console.log(`adding a new person`);
    const data = request.body; 
    const number = +data.phone; 

    if (persons.find(each=>each.name === data.name)){
        const err = {error: 'Name must be unique'}; 
        return response.status(400).send(err); 
    } else if (data.name=="" || !data.name){
        const err = {error: 'Person needs a name'}
        return response.status(400).send(err); 
    } else if (!number || number<1){
        const err = {error: 'Number must be valid'};
        return response.status(400).send(err); 
    }

    const newPerson = {
        name: data.name, 
        number: data.number, 
        id: genId()
    }
    persons = persons.concat(newPerson); 
    response.json(newPerson); 
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// define port and tell app to listen at it
const PORT = process.env.PORT || 3001; 
app.listen(PORT); 


