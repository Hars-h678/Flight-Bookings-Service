const {Logger} = require('../config');
const {StatusCodes} = require("http-status-codes")
const AppError = require('../utils/errors/app-error')
class CrudRepository{
    constructor(model){
        this.model=model
    }

    async create(data){
        
            const response=await this.model.create(data);
            console.log(response);
            return response;

    }

    async destroy(data){
            const response=await this.model.destroy({where:{id:data}});
            if(!response)  throw new AppError('There is no Data corresponding to the given id', StatusCodes.NOT_FOUND)
            return response;
        
    }

    async get(data){
            const response=await this.model.findByPk(data);
            //console.log("hy")
            if(!response) throw new AppError('There is no data corrresponding to given Id', StatusCodes.NOT_FOUND);
            return response;
      
    }

    async getAll(){
       
            const response=await this.model.findAll();
            if(!response) throw new AppError('The City Model is empty' , StatusCodes.NOT_FOUND);
            return response;// u can put whre clause here also 
       
    }

    async update(id,data){// data will be an object which will row and column
       
            const response=await this.model.update(data,{where:{id:id}});
            return response;
        
    }
}
module.exports ={
    CrudRepository
}