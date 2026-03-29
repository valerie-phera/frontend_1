// import { useNavigate, useLocation } from "react-router-dom";
// import { useState } from "react";

// import PersonalData from "../../components/PersonalData/PersonalData";
// import BottomBlock from "../../components/BottomBlock/BottomBlock";
// import Button from "../../components/Button/Button";
// import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";
// import Container from "../../components/Container/Container";

// import styles from "./AddDetailsPage.module.css";

// const AddDetailsPage = () => {
//     const navigate = useNavigate();
//     const { state } = useLocation();
//     const phValue = state?.phValue;
//     const phLevel = state?.phLevel;
//     const timestamp = state?.timestamp;
//     const interpretation = state?.interpretation;
//     const recommendations = state?.recommendations;

//     // Pre-fill user details if they were passed from the previous screen
//     // Otherwise initialize with empty/default values
//     const [age, setAge] = useState(state?.age || "");
//     const [ethnicBackground, setEthnicBackground] = useState(state?.ethnicBackground || []);
//     const [menstrualCycle, setMenstrualCycle] = useState(state?.menstrualCycle || []);
//     const [hormoneDiagnoses, setHormoneDiagnoses] = useState(state?.hormoneDiagnoses || []);
//     const [birthControl, setBirthControl] = useState(
//         state?.birthControl || {
//             general: null,
//             pill: null,
//             iud: null,
//             otherHormonalMethods: null,
//             permanentMethods: null,
//         }
//     );
//     const [hormoneTherapy, setHormoneTherapy] = useState(
//         state?.hormoneTherapy || {
//             general: null,
//             hormoneReplacement: []
//         }
//     );
//     const [fertilityJourney, setFertilityJourney] = useState(
//         state?.fertilityJourney || {
//             currentStatus: null,
//             fertilityTreatments: []
//         }
//     );
//     const [discharge, setDischarge] = useState(state?.discharge || []);
//     const [vulvaCondition, setVulvaCondition] = useState(state?.vulvaCondition || []);
//     const [smell, setSmell] = useState(state?.smell || []);
//     const [urination, setUrination] = useState(state?.urination || []);
//     const [notes, setNotes] = useState(state?.notes || "");

//     return (
//         <>
//             <div className={styles.content} data-scroll-container>
//                 <Container>
//                     <div className={styles.containerInner}>
//                         <div className={styles.heading}>
//                             <h1 className={styles.title}>To help us give you more accurate and meaningful insights, please select what best describes you.</h1>
//                             <p className={styles.privacyPolicy}>
//                                 We process your responses in real time only to provide context for your result. They are not stored. You can read more in our <a href="#">Privacy Policy</a>.
//                             </p>
//                         </div>
//                         <div className={styles.personalData}>
//                             {/* Main form component where user selects personal details */}
//                             <PersonalData
//                                 age={age}
//                                 setAge={setAge}
//                                 ethnicBackground={ethnicBackground}
//                                 setEthnicBackground={setEthnicBackground}
//                                 menstrualCycle={menstrualCycle}
//                                 setMenstrualCycle={setMenstrualCycle}
//                                 hormoneDiagnoses={hormoneDiagnoses}
//                                 setHormoneDiagnoses={setHormoneDiagnoses}
//                                 birthControl={birthControl}
//                                 setBirthControl={setBirthControl}
//                                 hormoneTherapy={hormoneTherapy}
//                                 setHormoneTherapy={setHormoneTherapy}
//                                 fertilityJourney={fertilityJourney}
//                                 setFertilityJourney={setFertilityJourney}
//                                 discharge={discharge}
//                                 setDischarge={setDischarge}
//                                 vulvaCondition={vulvaCondition}
//                                 setVulvaCondition={setVulvaCondition}
//                                 smell={smell}
//                                 setSmell={setSmell}
//                                 urination={urination}
//                                 setUrination={setUrination}
//                                 notes={notes}
//                                 setNotes={setNotes}
//                             />
//                         </div>
//                     </div>
//                 </Container>
//                 <BottomBlock>
//                     {/* On submit: navigate to detailed results page and pass all user inputs */}
//                     <Button
//                         onClick={() => navigate("/result-with-details", {
//                             state: {
//                                 phValue,
//                                 phLevel,
//                                 timestamp,
//                                 interpretation,
//                                 recommendations,
//                                 age,
//                                 ethnicBackground,
//                                 menstrualCycle,
//                                 hormoneDiagnoses,
//                                 birthControl,
//                                 hormoneTherapy,
//                                 fertilityJourney,
//                                 discharge,
//                                 vulvaCondition,
//                                 smell,
//                                 urination,
//                                 notes
//                             }
//                         })}
//                     >
//                         Save details
//                     </Button>
//                     <ButtonReverse onClick={() => navigate("/result-without-details")}>Go back</ButtonReverse>
//                 </BottomBlock>
//             </div>
//         </>
//     )
// };

// export default AddDetailsPage;




import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

import PersonalData from "../../components/PersonalData/PersonalData";
import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";
import Container from "../../components/Container/Container";

import styles from "./AddDetailsPage.module.css";

const AddDetailsPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const phValue = state?.phValue;
    const phLevel = state?.phLevel;
    const timestamp = state?.timestamp;
    const interpretation = state?.interpretation;
    const recommendations = state?.recommendations;

    // Pre-fill user details if they were passed from the previous screen
    // Otherwise initialize with empty/default values
    const [age, setAge] = useState(state?.age || "");
    const [ethnicBackground, setEthnicBackground] = useState(state?.ethnicBackground || []);
    const [menstrualCycle, setMenstrualCycle] = useState(state?.menstrualCycle || []);
    const [hormoneDiagnoses, setHormoneDiagnoses] = useState(state?.hormoneDiagnoses || []);
    const [birthControl, setBirthControl] = useState(
        state?.birthControl || {
            general: null,
            pill: null,
            iud: null,
            otherHormonalMethods: null,
            permanentMethods: null,
        }
    );
    const [hormoneTherapy, setHormoneTherapy] = useState(
        state?.hormoneTherapy || {
            general: null,
            hormoneReplacement: []
        }
    );
    const [fertilityJourney, setFertilityJourney] = useState(
        state?.fertilityJourney || {
            currentStatus: null,
            fertilityTreatments: []
        }
    );
    const [discharge, setDischarge] = useState(state?.discharge || []);
    const [vulvaCondition, setVulvaCondition] = useState(state?.vulvaCondition || []);
    const [smell, setSmell] = useState(state?.smell || []);
    const [urination, setUrination] = useState(state?.urination || []);
    const [notes, setNotes] = useState(state?.notes || "");

    return (
        <>
            <div className={styles.content} data-scroll-container>
                <Container>
                    <div className={styles.containerInner}>
                        <div className={styles.heading}>
                            <h1 className={styles.title}>To help us give you more accurate and meaningful insights, please select what best describes you.</h1>
                            <p className={styles.privacyPolicy}>
                                We process your responses in real time only to provide context for your result. They are not stored. You can read more in our <a href="#">Privacy Policy</a>.
                            </p>
                        </div>
                        <div className={styles.personalData}>
                            {/* Main form component where user selects personal details */}
                            <PersonalData
                                age={age}
                                setAge={setAge}
                                ethnicBackground={ethnicBackground}
                                setEthnicBackground={setEthnicBackground}
                                menstrualCycle={menstrualCycle}
                                setMenstrualCycle={setMenstrualCycle}
                                hormoneDiagnoses={hormoneDiagnoses}
                                setHormoneDiagnoses={setHormoneDiagnoses}
                                birthControl={birthControl}
                                setBirthControl={setBirthControl}
                                hormoneTherapy={hormoneTherapy}
                                setHormoneTherapy={setHormoneTherapy}
                                fertilityJourney={fertilityJourney}
                                setFertilityJourney={setFertilityJourney}
                                discharge={discharge}
                                setDischarge={setDischarge}
                                vulvaCondition={vulvaCondition}
                                setVulvaCondition={setVulvaCondition}
                                smell={smell}
                                setSmell={setSmell}
                                urination={urination}
                                setUrination={setUrination}
                                notes={notes}
                                setNotes={setNotes}
                            />
                        </div>
                    </div>
                </Container>
                <BottomBlock>
                    {/* On submit: navigate to detailed results page and pass all user inputs */}
                    <Button
                        onClick={() => navigate("/result-with-details", {
                            state: {
                                phValue,
                                phLevel,
                                timestamp,
                                interpretation,
                                recommendations,
                                age,
                                ethnicBackground,
                                menstrualCycle,
                                hormoneDiagnoses,
                                birthControl,
                                hormoneTherapy,
                                fertilityJourney,
                                discharge,
                                vulvaCondition,
                                smell,
                                urination,
                                notes
                            }
                        })}
                    >
                        Save details
                    </Button>
                    <ButtonReverse onClick={() => navigate("/result-without-details")}>Go back</ButtonReverse>
                </BottomBlock>
            </div>
        </>
    )
};

export default AddDetailsPage;