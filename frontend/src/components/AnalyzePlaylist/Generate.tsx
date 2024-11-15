import React, {useState} from 'react';
import { useAuth } from '../../utils/Authorization';
import { Playlist } from '../../types';
import { Button, Form } from 'react-bootstrap';
import Error from '../../components/Error'
import { Modal } from 'bootstrap';
import axios from 'axios';

interface PlaylistProps{
    playlist: Playlist;
}
const Generate: React.FC<PlaylistProps> = ({playlist}) =>{
    const {accessToken} = useAuth();
    const [showGenerateModal, setGenerateModal] = useState(false);
    const handleShow = () => setGenerateModal(true);
    const handleHide = () => setGenerateModal(false);

    const [progress, setProgress] = useState(0); // Progress value (0 to 100)
    const [currentStage, setCurrentStage] = useState(0); // Current stage index
    
    const [generateSong, setGenerateSong] = useState(false);
    const [generatePlaylist, setGeneratePlaylist] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const stages = ["analyzing audio feature...", 
        "looking at the genre data...", 
        "running some machine learning algorithms...", 
        "asking chatgpt for help...", "success!"];

    const handleGenerationChoice = (choice:boolean, type:number)=>{
        if(type == 0){
            setGenerateSong(choice)
            setGeneratePlaylist(!choice);
        }else{
            setGenerateSong(!choice)
            setGeneratePlaylist(choice);
        }
    }
    const handleGenerationProcess = async () => {
        setIsGenerating(true);
        for (let i = 0; i < stages.length; i++) { 
            //split each bar from 100/5 = 20 , then each stage gets to work from (0-20), then (20-40, then (60-80) then 80-> 100 on success to stimulate a live progress bar and not in blocks
            const currentRange = [(i*20), (i+1)*20];
            setCurrentStage(i); // Update the current stage
            await handleTask(currentStage, currentRange);
            // Simulate each stage with a delay
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        setIsGenerating(false);
    };
    async function handleTask(stage:number, range:number[]){
        switch(stage){
            case 0:
                return analyzePlaylistAudio(range);
            case 1:
                break;
            case 2:
                break;
            case 3:
                break;
            case 4:
                break;
            default:
                break;
        }
    }
    const analyzePlaylistAudio = (range: number[]) =>{
        //analyze playlist's audio analysis feature 
    }
    
    

    if(!accessToken){
        return(<Error data={{message:"Access Token has expired, please try again!"}}></Error>);
    }

    return (<>
        <Button className='btn btn-success mb-2 mr-2 uppercase-text' onClick = {handleShow} >Generate</Button>
            <div
                className={`modal fade ${showGenerateModal ? "show d-block" : ""}`}
                tabIndex={-1}
                aria-labelledby="staticBackdropLabel"
                aria-hidden={!showGenerateModal}
                style={showGenerateModal ? { backgroundColor: "rgba(0,0,0,0.8)" } : {}}
            >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="staticBackdropLabel">musicfinder2000 generator</h1>
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={handleHide}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="d-flex gap-2">
                        <p className=''>Choose a mode:</p>
                            <Button variant={generateSong ? "success" : "outline-secondary"}
                                className={`btn ${generateSong ? "active" : ""} uppercase-text `}
                                onClick={()=>handleGenerationChoice(!generateSong, 0)}
                                disabled={isGenerating}>
                                Generate Song
                            </Button>
                            <Button
                                variant={generatePlaylist ? "success" : "outline-secondary"}
                                className={`btn ${generatePlaylist ? "active" : ""} uppercase-text`}
                                onClick={()=>handleGenerationChoice(!generatePlaylist, 1)}
                                disabled={isGenerating}>
                                Generate Playlist
                            </Button>
                        </div>
                        <div className='d-flex flex-column align-items-start'>
                        <p className='mb-1'>yerrr</p>
                        <div className="progress w-100" role="progressbar" aria-label="Success example" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                            <div className="progress-bar bg-success" style={{width:`${progress}%`}}>{Math.floor(progress)}%</div>
                        </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleHide}
                            disabled={isGenerating}
                        >
                            Close
                        </button>
                        <button type="button" className="btn btn-success"  onClick={handleGenerationProcess} disabled={isGenerating}>
                            {isGenerating? "Generating...": "Go!"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default Generate;