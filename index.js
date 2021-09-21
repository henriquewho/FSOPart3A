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
    .catch (err => errorHandler(err)); 
})

app.get('/api/persons/:id', (request, response)=>{
    Person.findById(request.params.id).then(result=>{
        console.log(`Found the person with id ${request.params.id}`);
        response.json(result); 
    })
    .catch (err => errorHandler(err)); 
})

app.get('/info', (request, response)=>{
    Person.find({}).then(result=>{
        const now = new Date(); 
        const string = `<p>Phonebook has info for ${result.length} people</p>
        <p>${now}</p>`; 
        response.send(string); 
    })
    .catch (err => errorHandler(err));
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
    .catch (err => errorHandler(err)); 
})

app.delete('/api/persons/:id', (request, response) => {
    console.log(`Delete person with id: `, request.params.id);
    Person.findByIdAndRemove(request.params.id)
    .then(resp =>{
        response.status(204).end(); 
    })
    .catch(err =>{
        console.log(err);
        errorHandler(err); 
    })
})

app.put('/api/persons/:id', (request, response) =>{
    const id = request.params.id; 
    const data = request.body; 

    const person = {
        name: data.name, number: data.number
    }

    Person.findByIdAndUpdate(id, person, {new:true})
    .then( result =>{
        response.json(result); 
    })
    .catch(err => errorHandler(err)); 
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message);
    if (error.name === 'CastError'){
        return response.status(400).send({ error: 'malformatted id' })
    }
    next(error); 
}

// define port and tell app to listen at it
const PORT = process.env.PORT || 3001; 
app.listen(PORT); 


