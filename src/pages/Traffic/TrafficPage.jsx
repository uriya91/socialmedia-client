import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosConfig";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Spinner from "../../components/Spinner";
import "./TrafficPage.css";

const TrafficPage = () => {
  const [postData, setPostData] = useState([]);
  const [commentData, setCommentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, commentsRes] = await Promise.all([
          axios.get("/traffic/posts"),
          axios.get("/traffic/comments")
        ]);

        setPostData(Array.isArray(postsRes.data) ? postsRes.data : []);
        setCommentData(Array.isArray(commentsRes.data) ? commentsRes.data : []);
      } catch (err) {
        console.error("Error fetching traffic data:", err);
        setPostData([]);
        setCommentData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="traffic-container">
      <h1 className="traffic-title">🧙 Website's Magical Traffic</h1>

      <div className="chart-section">
        <h2 className="chart-title">✨ Posts per Day</h2>
        {postData.length > 0 ? (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={postData}>
              <CartesianGrid stroke="#444" />
              <XAxis dataKey="date" tick={{ fontSize: 16, fill: "gold" }} />
              <YAxis tick={{ fontSize: 18, fill: "gold" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#222", borderColor: "gold" }}
              />
              <Legend wrapperStyle={{ fontSize: 18, color: "gold" }} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#00FFC6"
                strokeWidth={4}
                name="Posts Count"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="no-data">No post data available.</p>
        )}
      </div>

      <div className="chart-section">
        <h2 className="chart-title">💬 Comments per Day</h2>
        {commentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={commentData}>
              <CartesianGrid stroke="#444" />
              <XAxis dataKey="date" tick={{ fontSize: 16, fill: "gold" }} />
              <YAxis tick={{ fontSize: 18, fill: "gold" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#222", borderColor: "gold" }}
              />
              <Legend wrapperStyle={{ fontSize: 18, color: "gold" }} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#FF6B6B"
                strokeWidth={4}
                name="Comments Count"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="no-data">No comment data available.</p>
        )}
      </div>
    </div>
  );
};

export default TrafficPage;