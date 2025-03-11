import { FaPlane, FaBus, FaTrain, FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const About: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="about-container">
            <FaArrowLeft className="back-arrow" onClick={() => navigate(-1)} />
            <h1>О проекте</h1>
            <p>
                WayPoint — это клиент-серверный маркетплейс пассажирских перевозок,
                позволяющий искать маршруты, бронировать билеты и управлять поездками.
            </p>
            <p>
                Проект поддерживает маршруты между основными городами и транспортными
                узлами, автоматически подбирая наиболее удобные рейсы.
            </p>
        </div>
    );
};

export default About;
