import React from "react";
import { Container, Card, Button } from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import MyBreadcrumb from "@components/MyBreadcrumb";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status");
  const isSuccess = status === "PAID";

  // const breadcrumbItems = [
  //   { label: "Home", path: "/" },
  //   { label: "Payment Result", path: "/payment/result" },
  // ];

  return (
    <Container className="w-100 fade-in p-4">
      {/* <MyBreadcrumb items={breadcrumbItems} /> */}
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <Card className="text-center p-4" style={{ maxWidth: "500px", width: "100%" }}>
          <Card.Body>
            {isSuccess ? (
              <>
                <FaCheckCircle className="text-success mb-3" style={{ fontSize: "4rem" }} />
                <h3 className="mb-3">Payment Successful!</h3>
                <p className="text-muted mb-4">
                  Your payment has been processed successfully. Thank you for your business!
                </p>
              </>
            ) : (
              <>
                <FaTimesCircle className="text-danger mb-3" style={{ fontSize: "4rem" }} />
                <h3 className="mb-3">Payment Failed</h3>
                <p className="text-muted mb-4">
                  There was an issue processing your payment. Please try again or contact support.
                </p>
              </>
            )}
            <Button 
              variant={isSuccess ? "success" : "danger"} 
              onClick={() => navigate("/bookings")}
            >
              Back to Bookings
            </Button>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default PaymentResult; 