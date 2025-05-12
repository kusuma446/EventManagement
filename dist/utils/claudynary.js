"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryUpload = cloudinaryUpload;
exports.extractPublicIdFromUrl = extractPublicIdFromUrl;
exports.cloudinaryRemove = cloudinaryRemove;
const cloudinary_1 = require("cloudinary");
const streamifier = __importStar(require("streamifier"));
const config_1 = require("../config");
cloudinary_1.v2.config({
    api_key: config_1.CLOUDINARY_KEY || "",
    api_secret: config_1.CLOUDINARY_SECRET || "",
    cloud_name: config_1.CLOUDINARY_NAME || "",
});
function cloudinaryUpload(file) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream((err, res) => {
            if (err)
                return reject(err);
            resolve(res);
        });
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
}
function extractPublicIdFromUrl(url) {
    try {
        const urlParts = url.split("/");
        const publicId = urlParts[urlParts.length - 1].split(".")[0];
        return publicId;
    }
    catch (err) {
        throw err;
    }
}
function cloudinaryRemove(secure_url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const publicId = extractPublicIdFromUrl(secure_url);
            return yield cloudinary_1.v2.uploader.destroy(publicId);
        }
        catch (err) {
            throw err;
        }
    });
}
