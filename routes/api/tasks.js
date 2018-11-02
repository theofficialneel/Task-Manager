const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//Model
const Task = require('../../models/task');
const User = require('../../models/users');


//Routes
router.get('/', (req, res, next) => {
    Task
    .find()
    .select('author title description timestamp _id')
    .populate('author', 'name username email')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            tasks: docs.map(doc => {
                return {
                    _id: doc._id,
                    author: doc.author,
                    title: doc.title,
                    description: doc.description,
                    timestamp: doc.timestamp,
                    request: {
                        type: 'GET',
                        url: req.protocol + '://' + req.get('host') + '/api/tasks/' + doc._id
                    }
                }
            })
        };
        res.status(200).json(response);
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.post('/', (req, res, next) => {

    User
    .findById(req.body.author)
    .exec()
    .then(user => {

        if(!user) {
            return res.status(404).json({
                message: "User not Found"
            });
        }

        const task = new Task({
            _id: new mongoose.Types.ObjectId(),
            title: req.body.title,
            description: req.body.description,
            author: req.body.author
        });  
        return task.save();
    })
    .then(result => {
        res.status(201).json({
            message: "Created task successfully",
            createdTask: {
                _id: result._id,
                title: result.title,
                description: result.description,
                timestamp: result.timestamp,
                author: result.author,
                request: {
                    type: 'GET',
                    url: req.protocol + '://' + req.get('host') + '/api/tasks/' + result._id
                }
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.get('/:taskId', (req, res, next) =>{
    const id = req.params.taskId;
    Task
    .findById(id)
    .select('author title description timestamp _id')
    .populate('author', 'name username email')
    .exec()
    .then(task => {
        if(task){
            res.status(200).json({
                task: task,
                request: {
                    type: 'GET',
                    description: 'Get all task data',
                    url: req.protocol + '://' + req.get('host') + 'api/tasks/'
                }
            });
        }else{
            res.status(404).json({message: 'No valid entry found with the provided ID'})
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});


router.patch('/:taskId', (req, res, next) =>{
    const id = req.params.taskId;
    const updateOps = {};

    for ( const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }

    // update time
    if(updateOps != {}){
        updateOps["timestamp"] = Date.now();
    }

    Task
    .update({_id: id}, {$set: updateOps})
    .exec()
    .then(result => {
        res.status(200).json({
            message: "Task updated",
            request: {
                type: 'GET',
                url: req.protocol + '://' + req.get('host') + '/api/tasks/' + id
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});


router.delete('/:taskId', (req, res, next) =>{
    const id = req.params.taskId;
    Task
    .remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'You have deleted the task',
            request: {
                type: 'GET',
                url: req.protocol + '://' + req.get('host') + '/api/tasks/'
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});


module.exports = router;