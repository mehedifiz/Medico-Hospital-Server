import doctorModel from "../models/docorModel.js";


const changeAvailablity = async(req , res)=>{

    try {

        const {docId} = req.body;

        const docData  = await doctorModel.findById(docId)

        await doctorModel.findByIdAndUpdate(docId , {
            available: !docData.available
        })

        res.json({success: true , message: 'Availability Changed'})


        
    } catch (error) {
        console.log(err)
    res.json({success: false , message: err.message})
    }
}


const doctorList = async(req , res )=>{
    console.log('called')
    try {
        const doctors = await doctorModel.find({}).select(['-password' , '-email'])
        res.json({success:true , doctors})
        
    } catch (error) {
        console.log(err)
        res.json({success: false , message: err.message})
        
    }
}

export {changeAvailablity , doctorList}