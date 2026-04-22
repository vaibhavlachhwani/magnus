import requests
import os
import random
import uuid
import argparse
import sys

# Configuration
BASE_URL = "http://localhost:8080"
TEMP_DATA_DIR = "benchmark_files"

def setup():
    if not os.path.exists(TEMP_DATA_DIR):
        os.makedirs(TEMP_DATA_DIR)
    print(f"[*] Setup: Using {TEMP_DATA_DIR} directory for temporary files")

def create_student():
    """Registers a dummy student to associate documents with."""
    name = f"Correctness_Student_{uuid.uuid4().hex[:8]}"
    try:
        response = requests.post(f"{BASE_URL}/students/register", json={"name": name})
        response.raise_for_status()
        return response.json()['id']
    except Exception as e:
        print(f"[!] Error: Could not register student: {e}")
        sys.exit(1)

def generate_file(path, size=1024 * 100):
    """Generates a file with random binary data."""
    with open(path, 'wb') as f:
        f.write(os.urandom(size))
    return path

def corrupt_file(original_path):
    """Creates a copy of the file with one byte modified."""
    with open(original_path, 'rb') as f:
        data = bytearray(f.read())
    
    # Flip a random byte
    if len(data) > 0:
        idx = random.randint(0, len(data) - 1)
        data[idx] = (data[idx] + 1) % 256
    
    corrupted_path = original_path + ".forged"
    with open(corrupted_path, 'wb') as f:
        f.write(data)
    return corrupted_path

def run_correctness_tests(n):
    print(f"[*] Starting Correctness Test: {n} authentic and {n} forged documents")
    student_id = create_student()
    
    # Positive = Forged, Negative = Authentic
    tp = 0 # Actually Forged, Predicted Forged
    fn = 0 # Actually Forged, Predicted Authentic
    tn = 0 # Actually Authentic, Predicted Authentic
    fp = 0 # Actually Authentic, Predicted Forged
    
    # 1. Authentic Tests (Negative Class)
    print(f"\n[+] Running {n} Authentic Tests...")
    for i in range(n):
        file_path = os.path.join(TEMP_DATA_DIR, f"auth_{i}.dat")
        generate_file(file_path)
        
        try:
            # Upload
            with open(file_path, 'rb') as f:
                requests.post(
                    f"{BASE_URL}/documents/upload",
                    files={"file": f},
                    data={"studentId": student_id}
                ).raise_for_status()
            
            # Verify
            with open(file_path, 'rb') as f:
                resp = requests.post(f"{BASE_URL}/verify", files={"file": f})
            
            if resp.status_code == 200 and resp.json().get('authentic') is True:
                tn += 1
            else:
                fp += 1
                print(f"    [FAIL] Authentic file {i} failed (Predicted Forged): {resp.text}")
                
        except Exception as e:
            fp += 1
            print(f"    [ERROR] Authentic test {i} failed: {e}")
        finally:
            if os.path.exists(file_path): os.remove(file_path)

    # 2. Forged Tests (Positive Class)
    print(f"\n[+] Running {n} Forged Tests...")
    for i in range(n):
        original_path = os.path.join(TEMP_DATA_DIR, f"orig_forged_{i}.dat")
        generate_file(original_path)
        
        try:
            # Upload original
            with open(original_path, 'rb') as f:
                requests.post(
                    f"{BASE_URL}/documents/upload",
                    files={"file": f},
                    data={"studentId": student_id}
                ).raise_for_status()
            
            # Corrupt and verify
            forged_path = corrupt_file(original_path)
            with open(forged_path, 'rb') as f:
                resp = requests.post(f"{BASE_URL}/verify", files={"file": f})
            
            # Forged files should return 404 (Not Found) or authentic: false
            if (resp.status_code == 404 or resp.status_code == 200) and resp.json().get('authentic') is False:
                tp += 1
            else:
                fn += 1
                print(f"    [FAIL] Forged file {i} passed (Predicted Authentic): {resp.status_code}")
                
        except Exception as e:
            # If request fails, we'll count it based on expected behavior, 
            # but usually forged test failing to connect isn't a TP.
            # For simplicity in benchmarking, we'll mark it as a failure to detect if it didn't return 'unauthentic'.
            fn += 1 
            print(f"    [ERROR] Forged test {i} failed: {e}")
        finally:
            if os.path.exists(original_path): os.remove(original_path)
            if os.path.exists(forged_path): os.remove(forged_path)

    report(n, tp, fp, tn, fn)

def report(n, tp, fp, tn, fn):
    print("\n" + "="*70)
    print("DOCUMENT AUTHENTICITY CORRECTNESS REPORT")
    print("="*70)
    
    # Perspective 1: Forged Detection (Forged = Positive)
    # TP: Actually Forged, Predicted Forged
    # FP: Actually Authentic, Predicted Forged
    # TN: Actually Authentic, Predicted Authentic
    # FN: Actually Forged, Predicted Authentic

    # Perspective 2: Authentic Detection (Authentic = Positive)
    # TP_a: Actually Authentic, Predicted Authentic (same as TN)
    # FP_a: Actually Forged, Predicted Authentic (same as FN)
    # TN_a: Actually Forged, Predicted Forged (same as TP)
    # FN_a: Actually Authentic, Predicted Forged (same as FP)
    
    tp_f, fp_f, tn_f, fn_f = tp, fp, tn, fn
    tp_a, fp_a, tn_a, fn_a = tn, fn, tp, fp

    print(f"{'Category':<20} | {'Tested':<10} | {'Passed':<10} | {'Success Rate':<12}")
    print("-" * 70)
    print(f"{'Authentic':<20} | {n:<10} | {tn_f:<10} | {(tn_f/n)*100 if n>0 else 0:>10.1f}%")
    print(f"{'Forged':<20} | {n:<10} | {tp_f:<10} | {(tp_f/n)*100 if n>0 else 0:>10.1f}%")
    print("-" * 70)
    print(f"{'TOTAL':<20} | {2*n:<10} | {tn_f+tp_f:<10} | {((tn_f+tp_f)/(2*n))*100 if n>0 else 0:>10.1f}%")

    # Matrix 1: Forged Detection
    print("\n[1] CONFUSION MATRIX: FORGED DOCUMENT DETECTION")
    print("-" * 70)
    print(f"{'':<25} | {'Predicted Forged':<20} | {'Predicted Authentic':<20}")
    print("-" * 70)
    print(f"{'Actually Forged':<25} | {tp_f:<20} | {fn_f:<20}")
    print(f"{'Actually Authentic':<25} | {fp_f:<20} | {tn_f:<20}")
    print("-" * 70)

    # Matrix 2: Authentic Detection
    print("\n[2] CONFUSION MATRIX: AUTHENTIC DOCUMENT DETECTION")
    print("-" * 70)
    print(f"{'':<25} | {'Predicted Authentic':<20} | {'Predicted Forged':<20}")
    print("-" * 70)
    print(f"{'Actually Authentic':<25} | {tp_a:<20} | {fn_a:<20}")
    print(f"{'Actually Forged':<25} | {fp_a:<20} | {tn_a:<20}")
    print("-" * 70)
    
    print(f"\nSummary Metrics (Forged Detection):")
    precision = tp_f / (tp_f + fp_f) if (tp_f + fp_f) > 0 else 0
    recall = tp_f / (tp_f + fn_f) if (tp_f + fn_f) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    print(f"- Precision: {precision:.2f}")
    print(f"- Recall:    {recall:.2f}")
    print(f"- F1 Score:  {f1:.2f}")
    print("="*70)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Magnus System Output Correctness Benchmark")
    parser.add_argument("-n", "--num", type=int, default=10, help="Number of authentic and forged documents to test (default: 10)")
    args = parser.parse_args()

    setup()
    run_correctness_tests(args.num)
