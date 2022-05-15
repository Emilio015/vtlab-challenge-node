import Deliveries from '@/models/Deliveries.model';
import Products from '@/models/Products.model';

const find = async(req) => {
    // some vars
    let query = {};
    let limit = req.body.limit ? (req.body.limit > 100 ? 100 : parseInt(req.body.limit)) : 100;
    let skip = req.body.page ? ((Math.max(0, parseInt(req.body.page)) - 1) * limit) : 0;
    let sort = { _id: 1 };

    // Extra parameters
    let weight = req.body.weight ? parseInt(req.body.weight) : null;
    let dateFrom = req.body.dateFrom ? new Date(req.body.dateFrom) : null;
    let dateTo = req.body.dateTo ? new Date(req.body.dateTo) : null;

    if (weight) {
        let products = await Products.find({ weight: { $gte: weight } });
        products = products.map(item => item._id);

        query['products'] = {
            '$in': products
        }
    }


    if (dateFrom) {
        query['when'] = {
            '$gte': dateFrom
        }
    };

    if (dateTo) {
        query['when'] = {
            '$lte': dateTo
        }
    };

    let totalResults = await Deliveries.find(query).countDocuments();

    if (totalResults < 1) {
        throw {
            code: 404,
            data: {
                message: `We couldn't find any delivery`
            }
        }
    }

    let deliveries = await Deliveries
        .find(query)
        .populate('products')
        .skip(skip)
        .sort(sort)
        .limit(limit);

    return {
        totalResults: totalResults,
        deliveries
    }
}

const create = async(req) => {
    try {
        await Deliveries.create(req.body);
    } catch (e) {
        throw {
            code: 400,
            data: {
                message: `An error has occurred trying to create the delivery:
          ${JSON.stringify(e, null, 2)}`
            }
        }
    }
}

const findOne = async(req) => {
    let delivery = await Deliveries.findOne({ _id: req.body.id });
    if (!delivery) {
        throw {
            code: 404,
            data: {
                message: `We couldn't find a delivery with the sent ID`
            }
        }
    }
    return delivery;
}

export default {
    find,
    create,
    findOne
}