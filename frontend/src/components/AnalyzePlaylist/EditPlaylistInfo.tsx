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
const EditPlaylistInfo: React.FC<PlaylistProps> = ({playlist}) =>{
    const {accessToken} = useAuth();
    const [showEditInfoModal, setEditInfoModal] = useState(false);
    const handleShow = () => setEditInfoModal(true);
    const handleHide = () => setEditInfoModal(false);

    
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [isCollaborative, setIsCollaborative] = useState(false);
    
    const handleProfileUpdate = async()=>{
        if(!accessToken){
            return;
        }
        try{
            const payload = {
                name: title || undefined, // only send if not empty
                description: description || undefined,
                public: isPublic,
                collaborative: isCollaborative,
              };
            const response = await axios.put(`https://api.spotify.com/v1/playlists/${playlist.id}`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    },
                }
            );
            if(response.status === 200) {

                const modalElement = document.getElementById("staticBackdrop");
                console.log("Modal Element:", modalElement);
                if (modalElement) {
                  const modalInstance = Modal.getOrCreateInstance(modalElement);
                  //console.log("Modal instance:", modalInstance);
                  modalInstance.hide();
                }
                alert('Playlist updated successfully!');

                setEditInfoModal(false); 
            }

        }catch(err){
            console.log(err);
            throw err;
        }
    }

    if(!accessToken){
        return(<Error data={{message:"Access Token has expired, please try again!"}}></Error>);
    }

    return (<>
         <Button className="btn btn-primary mb-2 uppercase-text" data-bs-toggle="modal" data-bs-target="#staticBackdrop"onClick={handleShow}>Edit Playlist</Button>
            <div
                className={`modal fade ${showEditInfoModal ? "show d-block" : ""}`}
                id="staticBackdrop"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex={-1}
                aria-labelledby="staticBackdropLabel"
                aria-hidden={!showEditInfoModal}
                style={showEditInfoModal ? { backgroundColor: "rgba(0,0,0,0.5)" } : {}}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">
                                Updating Playlist <span className="tc-g">{playlist.name}</span>
                            </h1>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                onClick={handleHide}
                            ></button>
                        </div>
                        <div className="modal-body">
                        <Form>
                        <Form.Group className="mb-3" controlId="formTitle">
                        <Form.Label>Update Playlist Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={playlist.name}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formDescription">
                        <Form.Label>Update Playlist Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder= {playlist.description}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPublic">
                        <div className="d-flex gap-2">
                            <Button
                                variant={isPublic ? "success" : "outline-secondary"}
                                className={`btn ${isPublic ? "active" : ""}`}
                                onClick={() => setIsPublic(!isPublic)}
                            >
                                {isPublic ? "Public" : "Private"}
                            </Button>
                            <Button
                                variant={isCollaborative ? "success" : "outline-secondary"}
                                className={`btn ${isCollaborative ? "active" : ""}`}
                                onClick={() => setIsCollaborative(!isCollaborative)}
                            >
                                {isCollaborative ? "Collaborative" : "Not Collaborative"}
                            </Button>
                        </div>
                        </Form.Group>
                    </Form>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                                onClick={handleHide}
                            >
                                Close
                            </button>
                            <button type="button" className="btn btn-success" data-bs-dismiss="modal" onClick={handleProfileUpdate}>
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditPlaylistInfo;