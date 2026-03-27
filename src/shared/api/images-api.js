import backendInstance from "./instance";

export const addImage = async (payload) => {
    const { data } = await backendInstance.post("/api/upload", payload, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    });
    return data;
};


//--------------------------------- checked with Johannes -------------------------------------

// export const analyzePh = async (payload) => {
//     const { data } = await backendInstance.post(
//         "https://grade-healing-deadline-antiques.trycloudflare.com/api/analyze",
//         payload,
//         {
//             headers: {
//                 "Content-Type": "application/json",
//             }
//         }
//     );
//     return data;
// };

//----------------------------------------------------------------------




// export const analyzePh = async (payload) => {
//     const { data } = await backendInstance.post(
//         "https://phera-bff-beta-52458262724.europe-west10.run.app/",
//         payload,
//         {
//             headers: {
//                 "Content-Type": "application/json",
//             }
//         }
//     );
//     return data;
// };


export const analyzePh = async (payload) => {
    const { data } = await backendInstance.post("/api/analyze", payload);
    return data;
};



