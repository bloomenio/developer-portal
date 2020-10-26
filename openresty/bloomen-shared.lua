local _Module = {}

local mongo = require "mongo" 

local mongoUrl = os.getenv("MONGO_URL");
        
local client = mongo.Client('mongodb://' .. mongoUrl);

local apiKeyCollection = client:getCollection(os.getenv("MONGO_DB_NAME"), os.getenv("MONGO_DB_API_KEY_COLLECTION"));
local contractCollection = client:getCollection(os.getenv("MONGO_DB_NAME"), os.getenv("MONGO_DB_CONTRACT_COLLECTION"));

local data = {
    CONTRACT_ACCESS_TTL=tonumber(os.getenv("CONTRACT_ACCESS_TTL"),10),
    CONTRACT_TX_TTL=tonumber(os.getenv("CONTRACT_TX_TTL"),10),
    DEVELOPER_ACCESS_TTL=tonumber(os.getenv("DEVELOPER_ACCESS_TTL"),10),
    CONTRACT_NAME_TTL=tonumber(os.getenv("CONTRACT_NAME_TTL"),10),
 }

function starts_with(str, start)
    return str:sub(1, #start) == start;
end

function _Module.get(name)
    return data[name]
end

function _Module.processRLPField(input)
    local data = "";
    local remain = "";
    local firstByte = tonumber(input:sub(1,2),16);

    if firstByte <= 0x7f then
        data = input:sub(1, 2);
        remain = input:sub(3);                    
    elseif firstByte <= 0xb7 then
        local length = firstByte - 0x7f;
        if (firstByte == 0x80) then
            data = "empty";
        else 
            data = input:sub(3,length*2);
        end 
        remain = input:sub(length*2+1); 
    elseif firstByte <= 0xbf then
        local llength = firstByte - 0xb6;
        local length = tonumber(input:sub(2, llength*2), 16);
        data = input.slice(llength*2 +1, (length + llength)*2);
        remain = input:sub((length + llength)*2+1);
    elseif firstByte <= 0xf7 then
        local length = firstByte - 0xbf;
        data = "array header";
        remain = input:sub(length*2+1);
    else
        local length = firstByte - 0xf6;
        data = "array header";
        remain = input:sub(length*2+1);
    end
    return data,remain;
end 

function _Module.getContractName(contract)
    local c = ngx.shared.c;
    local contractName = c:get(contract);

    if (contract == '') then
        return '';
    end

    if (contractName == nill) then
        local queryObj = mongo.BSON{ 
            address = contract,
            public = true
        }
        local bsonContract = contractCollection:findOne(queryObj);
    
        if (bsonContract) then
            local contractObj = bsonContract:value();
            contractName =contractObj.name;
        else
            contractName = 'Unknown';
        end

        c:add(contract, contractName, data.CONTRACT_NAME_TTL); 
    end
    return contractName;
end

function _Module.checkApikeyContract(apiKey, contract)
    
    local da = ngx.shared.da;
    local isDeveloper = da:get(apiKey);

    if isDeveloper  then
        return isDeveloper;
    end

    local ca = ngx.shared.ca;                
    local key = apiKey:lower() .. "#" .. contract:lower();
    local value = ca:get(key);

    if (value == nill) then
        --  no cache hit. Trying to look it up in db  
        local t = os.date('*t'); -- time now
        local queryObj = mongo.BSON{ 
            name = apiKey, 
            expirationDate =  { ['$gt'] = mongo.DateTime(os.time(t)*1000)},
            ['$or'] =  {__array = 2, {role = 'developer'}, {contracts = { ['$elemMatch'] = { address = contract }}} }
        }
        local bsonApiKey = apiKeyCollection:findOne(queryObj);
        local ca = ngx.shared.ca;
        if (bsonApiKey) then
            local apiKeyObj = bsonApiKey:value();
            
            if (apiKeyObj.role == 'developer') then
                da:add(apiKey, true,  data.DEVELOPER_ACCESS_TTL); 
            else
                ca:add(key, true,  data.CONTRACT_ACCESS_TTL); 
            end                       
            return true;
        else
            ca:add(key, false, data.CONTRACT_ACCESS_TTL );
            return false;
        end
    else                    
        return value;
    end
end 

return _Module