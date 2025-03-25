import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import "./KanbanBoard.css"; // New CSS file for styling

function KanbanBoard() {
    const [columns, setColumns] = useState({
        todo: { name: "To Do", items: [] },
        inProgress: { name: "In Progress", items: [] },
        done: { name: "Done", items: [] },
    });
    const [newTask, setNewTask] = useState("");
    const [file, setFile] = useState(null);
    const user = JSON.parse(localStorage.getItem("user"));

    // Base URL for API calls (configurable for deployment)
    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

    // Fetch tasks on mount or when user changes
    useEffect(() => {
        if (user) {
            axios
                .get(`${API_BASE_URL}/tasks/${user.id}`)
                .then((res) => {
                    const tasks = res.data;
                    setColumns({
                        todo: { name: "To Do", items: tasks.filter((t) => t.status === "todo") },
                        inProgress: { name: "In Progress", items: tasks.filter((t) => t.status === "inProgress") },
                        done: { name: "Done", items: tasks.filter((t) => t.status === "done") },
                    });
                })
                .catch((err) => console.error("Failed to fetch tasks:", err));
        }
    }, [user, API_BASE_URL]);

    // Add a new task
    const addTask = async () => {
        if (!newTask || !user) return;

        const formData = { userId: user.id, title: newTask };
        try {
            if (file) {
                const reader = new FileReader();
                reader.onload = async () => {
                    formData.file = { name: file.name, data: reader.result.split(",")[1] };
                    await axios.post(`${API_BASE_URL}/tasks`, formData);
                    setNewTask("");
                    setFile(null);
                    fetchTasks();
                };
                reader.readAsDataURL(file);
            } else {
                await axios.post(`${API_BASE_URL}/tasks`, formData);
                setNewTask("");
                fetchTasks();
            }
        } catch (error) {
            console.error("Failed to add task:", error);
        }
    };

    // Delete a task
    const deleteTask = async (taskId) => {
        try {
            await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
            fetchTasks(); // Refresh tasks after deletion
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    };

    // Helper to fetch tasks
    const fetchTasks = () => {
        if (user) {
            axios
                .get(`${API_BASE_URL}/tasks/${user.id}`)
                .then((res) => {
                    const tasks = res.data;
                    setColumns({
                        todo: { name: "To Do", items: tasks.filter((t) => t.status === "todo") },
                        inProgress: { name: "In Progress", items: tasks.filter((t) => t.status === "inProgress") },
                        done: { name: "Done", items: tasks.filter((t) => t.status === "done") },
                    });
                })
                .catch((err) => console.error("Failed to fetch tasks:", err));
        }
    };

    // Handle drag-and-drop
    const onDragEnd = async (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceCol = columns[source.droppableId];
        const destCol = columns[destination.droppableId];
        const sourceItems = [...sourceCol.items];
        const [movedItem] = sourceItems.splice(source.index, 1);

        if (source.droppableId === destination.droppableId) {
            sourceItems.splice(destination.index, 0, movedItem);
            setColumns({ ...columns, [source.droppableId]: { ...sourceCol, items: sourceItems } });
        } else {
            const destItems = [...destCol.items];
            destItems.splice(destination.index, 0, movedItem);
            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceCol, items: sourceItems },
                [destination.droppableId]: { ...destCol, items: destItems },
            });
            try {
                await axios.put(`${API_BASE_URL}/tasks/${movedItem._id}`, {
                    status: destination.droppableId,
                });
            } catch (error) {
                console.error("Failed to update task status:", error);
                fetchTasks(); // Revert UI on failure
            }
        }
    };

    return (
        <div className="kanban-container">
            <div className="task-inputs">
                <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Enter task title"
                />
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <button onClick={addTask}>Add Task</button>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="kanban-columns">
                    {Object.entries(columns).map(([colId, column]) => (
                        <Droppable droppableId={colId} key={colId}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="kanban-column"
                                >
                                    <h2>{column.name}</h2>
                                    {column.items.map((item, index) => (
                                        <Draggable key={item._id} draggableId={item._id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="kanban-task"
                                                >
                                                    <span>{item.title}</span>
                                                    {item.fileUrl && (
                                                        <div>
                                                            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                View File
                                                            </a>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => deleteTask(item._id)}
                                                        className="delete-btn"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}

export default KanbanBoard;